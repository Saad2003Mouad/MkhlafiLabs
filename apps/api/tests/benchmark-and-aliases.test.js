// MIKHLAFI LABS — Automated Test Suite: Empirical Benchmark & Route Alias Normalization
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const BASE_URL = 'http://localhost:3000';

function fetchUrl(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, BASE_URL);
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

test('Empirical Benchmark & Route Alias Normalization Suite', async (t) => {
  await t.test('1. GET /api/v1/benchmarks/financial returns 200 with 533k SAP ERP benchmark results', async () => {
    const res = await fetchUrl('/api/v1/benchmarks/financial');
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.success, true);
    assert.ok(data.benchmark);
    assert.equal(data.benchmark.metadata.totalRows, 533009);
    assert.equal(data.benchmark.metadata.globalAnomalies, 70);
    assert.equal(data.benchmark.metadata.localAnomalies, 30);
    assert.ok(data.benchmark.empiricalValidation.accuracy > 99.0);
    assert.ok(data.benchmark.empiricalValidation.falsePositiveRate < 0.5);
  });

  await t.test('2. Direct domain paths resolve cleanly without 404 (Serving SPA Index)', async () => {
    const routesToTest = [
      '/finance',
      '/decisions',
      '/risk',
      '/projects',
      '/suppliers',
      '/customers',
      '/data-quality',
      '/assistant',
      '/organization',
      '/billing',
      '/settings',
      '/dashboard',
      '/services',
      '/features',
      '/about-us',
      '/contact-us'
    ];

    for (const route of routesToTest) {
      const res = await fetchUrl(route);
      assert.equal(res.statusCode, 200, `Expected 200 for route ${route}`);
      assert.ok(res.body.includes('<!DOCTYPE html>') || res.body.includes('<html'), `Expected HTML body for route ${route}`);
    }
  });
});
