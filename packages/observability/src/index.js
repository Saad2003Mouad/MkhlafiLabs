// @mikhlafi-labs/observability — Structured Logging, Metrics & Telemetry
export class Logger {
  static info(msg, meta = {}) {
    console.log(`[INFO] ${msg}`, JSON.stringify(meta));
  }
  static error(msg, meta = {}) {
    console.error(`[ERROR] ${msg}`, JSON.stringify(meta));
  }
}
