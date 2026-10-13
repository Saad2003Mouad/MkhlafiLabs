# ==============================================================================
# MIKHLAFI LABS — Enterprise Platform Multi-Stage Production Dockerfile
# Supports Cloud Edition (Managed Container) & Private Edition (On-Premises Air-Gapped)
# ==============================================================================

# ── Stage 1: Build Frontend SPA ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copy platform package manifest
COPY apps/platform/package*.json ./apps/platform/
WORKDIR /build/apps/platform
RUN npm ci

# Copy frontend source and configuration
COPY apps/platform/ ./
RUN npm run build

# ── Stage 2: Production Runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install security updates and utilities
RUN apk --no-cache add dumb-init curl ca-certificates && \
    addgroup -g 1001 -S mikhlafi && \
    adduser -S mikhlafi -u 1001 -G mikhlafi

# Copy API dependencies
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm ci --omit=dev

WORKDIR /app

# Copy root manifest and server
COPY package*.json ./
COPY server.js ./

# Copy API source, migrations, and shared assets
COPY apps/api/src ./apps/api/src
COPY assets ./assets
COPY data ./data

# Copy compiled frontend from builder stage
COPY --from=builder /build/apps/platform/dist ./apps/platform/dist

# Ensure storage directories exist with correct permissions
RUN mkdir -p /app/data/tenants /app/data/benchmarks && \
    chown -R mikhlafi:mikhlafi /app

USER mikhlafi

EXPOSE 3000

# Healthcheck targeting benchmark/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/benchmarks/financial || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
