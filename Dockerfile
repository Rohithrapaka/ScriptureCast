# ── Stage 1: Build ───────────────────────────────────────────────────────────
# Installs all dependencies and compiles the Vite frontend + esbuild server.
FROM node:24-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack (bundled with Node ≥ 16)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy workspace configuration first (better layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib/ lib/
COPY artifacts/ artifacts/
COPY scripts/ scripts/
COPY data/ data/

# Install all deps (dev deps needed for Vite + esbuild)
RUN pnpm install --frozen-lockfile

# Build the React frontend (output → artifacts/scripture-cast/dist/public)
RUN NODE_ENV=production pnpm --filter @workspace/scripture-cast run build

# Build the Express server bundle (output → artifacts/api-server/dist/index.mjs)
# esbuild produces a self-contained bundle — node_modules not needed at runtime.
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
# Minimal runtime image: just the bundle, frontend, and Bible data.
# No node_modules needed — everything is bundled by esbuild.
FROM node:24-alpine
WORKDIR /app

# Server bundle (esbuild self-contained, ~2 MB)
COPY --from=builder /app/artifacts/api-server/dist/ ./artifacts/api-server/dist/

# Compiled frontend (Vite build, served as static files by Express)
COPY --from=builder /app/artifacts/scripture-cast/dist/ ./artifacts/scripture-cast/dist/

# Bible datasets — loaded at runtime from disk by bibleParser.ts
COPY data/ data/

# Default port (override with -e PORT=xxxx or platform env var)
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Run from /app so process.cwd() resolves data/ and artifacts/ paths correctly
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
