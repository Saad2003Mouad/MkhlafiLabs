// MIKHLAFI LABS — Safe outbound connector for tenant data sources
// Performs real, verifiable HTTP(S) reads from a customer-configured endpoint.
// Defends against SSRF (private/loopback/link-local targets, redirect chains),
// caps response size and duration, and parses JSON or RFC-4180 CSV payloads.

import dns from 'node:dns/promises';
import net from 'node:net';
import { parseCsvRows, validateAndMapJournalCsv } from './csvParser.js';

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 60_000;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_REDIRECTS = 3;
const MAX_RECORDS = 50_000;

/**
 * Escape hatch so integration tests can point a connector at a loopback fixture
 * server. Requires both an explicit opt-in flag and a non-production environment,
 * so a production process can never be reconfigured into an SSRF proxy by a
 * stray environment variable alone.
 */
export function privateTargetsPermitted() {
  return process.env.MIKHLAFI_CONNECTOR_ALLOW_PRIVATE === '1' && process.env.NODE_ENV !== 'production';
}

export class ConnectorError extends Error {
  constructor(message, code = 'CONNECTOR_ERROR', detail = undefined) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    this.detail = detail;
  }
}

// ── SSRF guard ──────────────────────────────────────────────────────────────

function isBlockedIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isInteger(n) === false || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 127) return true; // this-host / loopback
  if (a === 10) return true; // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 192 && b === 0) return true; // IETF protocol assignments
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast / reserved / broadcast
  return false;
}

function isBlockedIPv6(ip) {
  const normalized = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  // IPv4-mapped (::ffff:127.0.0.1) and IPv4-compatible forms
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA
  if (normalized.startsWith('fe80')) return true; // link-local
  if (normalized.startsWith('ff')) return true; // multicast
  return false;
}

function isBlockedHostname(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.home.arpa') ||
    host.endsWith('.localdomain')
  ) {
    return true;
  }
  if (net.isIP(host)) {
    return net.isIPv4(host) ? isBlockedIPv4(host) : isBlockedIPv6(host);
  }
  return false;
}

/**
 * Validates an outbound target and resolves its addresses.
 * Throws ConnectorError when the target is malformed or points at non-public space.
 */
async function assertPublicTarget(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ConnectorError('Endpoint is not a valid absolute URL.', 'INVALID_URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ConnectorError('Only http:// and https:// endpoints are supported.', 'INVALID_SCHEME');
  }
  if (url.username || url.password) {
    throw new ConnectorError('Credentials must be supplied as headers, not embedded in the URL.', 'URL_CREDENTIALS_REJECTED');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const bypassGuards = privateTargetsPermitted();
  if (!bypassGuards && isBlockedHostname(hostname)) {
    throw new ConnectorError(`Target host "${hostname}" is not permitted.`, 'TARGET_BLOCKED');
  }

  if (bypassGuards) {
    return url;
  }

  // Resolve every address and confirm each is public (defeats DNS rebinding at connect time).
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch (err) {
    throw new ConnectorError(`DNS resolution failed for "${hostname}".`, 'DNS_FAILURE', err.message);
  }
  if (!addresses.length) {
    throw new ConnectorError(`DNS resolution returned no addresses for "${hostname}".`, 'DNS_FAILURE');
  }
  for (const entry of addresses) {
    const blocked = net.isIPv4(entry.address) ? isBlockedIPv4(entry.address) : isBlockedIPv6(entry.address);
    if (blocked) {
      throw new ConnectorError(`Target host resolves to a private or reserved address (${entry.address}).`, 'TARGET_BLOCKED');
    }
  }

  return url;
}

// ── Auth headers ────────────────────────────────────────────────────────────

function buildAuthHeaders(config = {}) {
  const headers = { Accept: 'application/json, text/csv, */*' };

  const apiKey = typeof config.api_key === 'string' ? config.api_key.trim() : '';
  const authType = String(config.auth_type || '').toLowerCase();

  if (apiKey) {
    if (authType.includes('bearer') || authType.includes('oauth')) {
      headers.Authorization = `Bearer ${apiKey}`;
    } else if (authType.includes('basic')) {
      headers.Authorization = `Basic ${Buffer.from(apiKey).toString('base64')}`;
    } else if (authType.includes('header') || authType.includes('api')) {
      headers['X-API-Key'] = apiKey;
      headers['Api-Key'] = apiKey;
    } else {
      headers.Authorization = `Bearer ${apiKey}`;
    }
  }

  if (config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers)) {
    for (const [key, value] of Object.entries(config.headers)) {
      if (typeof value !== 'string') continue;
      if (!/^[A-Za-z0-9-]+$/.test(key)) continue;
      if (/^(host|content-length|connection|transfer-encoding)$/i.test(key)) continue;
      headers[key] = value;
    }
  }

  return headers;
}

// ── Fetching ────────────────────────────────────────────────────────────────

async function readCappedBody(res) {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    throw new ConnectorError('Response exceeds the 10 MB connector limit.', 'RESPONSE_TOO_LARGE');
  }

  if (!res.body) return '';

  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      try {
        await reader.cancel();
      } catch {
        /* reader already closed */
      }
      throw new ConnectorError('Response exceeds the 10 MB connector limit.', 'RESPONSE_TOO_LARGE');
    }
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  const encoding = (res.headers.get('charset') || 'utf-8').toLowerCase();
  return buffer.toString(encoding === 'iso-8859-1' ? 'latin1' : 'utf8');
}

/**
 * Performs a single validated GET against a tenant-configured endpoint.
 * Follows at most MAX_REDIRECTS redirects, re-validating every hop.
 * @returns {Promise<{url: string, status: number, contentType: string, body: string}>}
 */
export async function fetchFromEndpoint(config = {}) {
  const endpointUrl = typeof config.endpoint_url === 'string' ? config.endpoint_url.trim() : '';
  if (!endpointUrl) {
    throw new ConnectorError('No endpoint URL is configured for this data source.', 'NOT_CONFIGURED');
  }

  const timeoutMs = Math.min(
    Math.max(Number(config.timeout_ms) || DEFAULT_TIMEOUT_MS, 1_000),
    MAX_TIMEOUT_MS
  );
  const headers = buildAuthHeaders(config);

  let currentUrl = endpointUrl;
  let response;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const validated = await assertPublicTarget(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(validated, { method: 'GET', headers, redirect: 'manual', signal: controller.signal });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ConnectorError(`Request timed out after ${timeoutMs} ms.`, 'TIMEOUT');
      }
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError(`Request failed: ${err.message}`, 'NETWORK_FAILURE', err.message);
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw new ConnectorError('Endpoint returned a redirect without a Location header.', 'BAD_REDIRECT');
      }
      if (hop === MAX_REDIRECTS) {
        throw new ConnectorError('Endpoint exceeded the redirect limit of 3.', 'TOO_MANY_REDIRECTS');
      }
      currentUrl = new URL(location, validated).toString();
      continue;
    }
    break;
  }

  if (!response.ok) {
    throw new ConnectorError(
      `Endpoint responded with HTTP ${response.status} ${response.statusText || ''}`.trim(),
      'HTTP_ERROR',
      { status: response.status }
    );
  }

  return {
    url: currentUrl,
    status: response.status,
    contentType: (response.headers.get('content-type') || '').toLowerCase(),
    body: await readCappedBody(response)
  };
}

// ── Payload parsing ─────────────────────────────────────────────────────────

function digPath(value, path) {
  if (!path) return value;
  let cursor = value;
  for (const segment of String(path).split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

function coerceArray(payload, recordPath) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    if (recordPath) {
      const dug = digPath(payload, recordPath);
      if (Array.isArray(dug)) return dug;
    }
    for (const key of ['data', 'records', 'items', 'rows', 'entries', 'results', 'result']) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return null;
}

function looksLikeCsv(contentType, body) {
  if (contentType.includes('csv')) return true;
  if (contentType.includes('json')) return false;
  const head = body.slice(0, 4096);
  if (!head.trim()) return false;
  if (/^[\s]*[[{]/.test(head)) return false;
  const firstLine = head.split(/\r?\n/, 1)[0] || '';
  return firstLine.includes(',') && /amount|total|value|date|document|invoice|number/i.test(firstLine);
}

/**
 * Parses a connector payload into normalized journal records.
 * @returns {{records: object[], errors: object[]}}
 */
export function parsePayload(body, contentType = '', recordPath = '') {
  if (!body || !body.trim()) {
    throw new ConnectorError('Endpoint returned an empty response body.', 'EMPTY_RESPONSE');
  }

  if (looksLikeCsv(contentType, body)) {
    try {
      const mapped = validateAndMapJournalCsv(parseCsvRows(body));
      return { records: mapped.validRecords, errors: mapped.errors };
    } catch (err) {
      throw new ConnectorError(err.message, 'CSV_PARSE_FAILURE');
    }
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new ConnectorError('Response was neither valid JSON nor parseable CSV.', 'UNPARSEABLE_PAYLOAD');
  }

  const rows = coerceArray(payload, recordPath);
  if (!rows) {
    throw new ConnectorError(
      'Could not locate an array of records in the response. Set a record path in the source configuration.',
      'RECORD_PATH_MISSING'
    );
  }
  if (rows.length === 0) return { records: [], errors: [] };
  if (rows.length > MAX_RECORDS) {
    throw new ConnectorError(`Endpoint returned ${rows.length} rows; the connector limit is ${MAX_RECORDS}.`, 'TOO_MANY_RECORDS');
  }

  const records = [];
  const errors = [];
  rows.forEach((row, index) => {
    const source = row && typeof row === 'object' ? row : {};
    const docNumber = source.documentNumber ?? source.document_number ?? source.document ?? source.invoiceNumber ?? source.number;
    const amountRaw = source.amount ?? source.amount_sar ?? source.amountSAR ?? source.total ?? source.value;

    if (!docNumber || String(docNumber).trim().length === 0) {
      errors.push({ row: index + 1, field: 'documentNumber', message: 'Missing document/invoice number.' });
      return;
    }
    const amount = Number(String(amountRaw ?? '').replace(/[,\s]/g, ''));
    if (!Number.isFinite(amount)) {
      errors.push({ row: index + 1, field: 'amount', message: `Malformed numeric amount: "${amountRaw}".` });
      return;
    }
    if (amount <= 0) {
      errors.push({ row: index + 1, field: 'amount', message: `Amount must be greater than zero: ${amount}.` });
      return;
    }

    const rawDate = source.postingDate ?? source.posting_date ?? source.date;
    let postingDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (Number.isNaN(parsedDate.getTime())) {
        errors.push({ row: index + 1, field: 'postingDate', message: `Invalid date format: "${rawDate}".` });
        return;
      }
      postingDate = parsedDate.toISOString().split('T')[0];
    }

    records.push({
      rowNumber: index + 1,
      documentNumber: String(docNumber).trim(),
      vendorName: source.vendorName ?? source.vendor_name ?? source.vendor ?? source.supplierName ?? source.supplier ?? 'General Supplier',
      amount,
      postingDate,
      accountNumber: source.accountNumber ?? source.account_number ?? source.account ?? source.glAccount ?? '101000',
      narrative: source.narrative ?? source.text ?? source.text_narrative ?? source.description ?? source.memo ?? 'Ledger Journal Posting'
    });
  });

  return { records, errors };
}

/**
 * Readiness probe: performs a real request and reports reachability plus the
 * shape of the payload without ingesting anything.
 */
export async function probeEndpoint(config = {}) {
  const startedAt = Date.now();
  const { url, status, contentType, body } = await fetchFromEndpoint(config);
  const latencyMs = Date.now() - startedAt;

  let format = 'unknown';
  let candidateCount = 0;
  let parseMessage = '';

  try {
    if (looksLikeCsv(contentType, body)) {
      format = 'csv';
      candidateCount = Math.max(parseCsvRows(body).length - 1, 0);
      parseMessage = 'CSV payload with recognised header row.';
    } else {
      format = 'json';
      const rows = coerceArray(JSON.parse(body), config.record_path);
      if (rows) {
        candidateCount = rows.length;
        parseMessage = 'JSON payload with a resolvable record collection.';
      } else {
        parseMessage = 'JSON payload, but no record collection resolved. Configure a record path.';
      }
    }
  } catch (err) {
    parseMessage = err.message;
  }

  return {
    reachable: true,
    url,
    httpStatus: status,
    contentType: contentType || 'not reported',
    format,
    candidateRecords: candidateCount,
    parseMessage,
    latencyMs
  };
}
