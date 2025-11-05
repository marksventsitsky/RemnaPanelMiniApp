# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy frontend source
COPY frontend/ ./

# Build frontend with API URL pointing to same origin
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# Stage 2: Build Backend
FROM oven/bun:1 AS backend-build

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY tsconfig.json ./
RUN bun install --frozen-lockfile

# Copy backend source
COPY src/ ./src/

# Build backend for production
RUN bun build src/server.ts --outdir dist --target bun --minify

# Stage 3: Production
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package.json for metadata
COPY package.json ./

# Copy production dependencies
COPY --from=backend-build /app/node_modules ./node_modules

# Copy built backend
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/src ./src

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./static

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start server with Bun
CMD ["bun", "run", "src/server.ts"]
