// MIKHLAFI LABS — High-Performance In-Memory Sliding-Window Rate Limiter
// Enforces endpoint-level request limits against brute-force and resource exhaustion attacks

class RateLimiter {
  constructor() {
    this.requests = new Map(); // key -> Array<timestamps>
    // Periodic garbage collection every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  getClientKey(req, prefix = '') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.socket?.remoteAddress ||
               '127.0.0.1';
    return `${prefix}:${ip}`;
  }

  isRateLimited(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.requests.get(key) || [];
    // Filter timestamps within the current sliding window
    timestamps = timestamps.filter(ts => ts > windowStart);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const resetTimeMs = Math.ceil((oldest + windowMs - now) / 1000);
      return {
        limited: true,
        retryAfterSeconds: Math.max(1, resetTimeMs),
        remaining: 0,
        total: maxRequests
      };
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      limited: false,
      retryAfterSeconds: 0,
      remaining: maxRequests - timestamps.length,
      total: maxRequests
    };
  }

  cleanup() {
    const now = Date.now();
    const maxWindow = 300000; // 5 minutes max window
    for (const [key, timestamps] of this.requests.entries()) {
      const active = timestamps.filter(ts => ts > (now - maxWindow));
      if (active.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, active);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();
