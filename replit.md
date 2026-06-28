# ScriptureCast

A browser-based bilingual Bible presentation platform for Telugu and English congregations. An operator controls the admin panel while the display screen (OBS-ready) updates in real time via Socket.IO.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — production build (frontend + server bundle)
- `pnpm start` — start the production server
- `pnpm run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required dev env: none (Bible data loads from JSON files; DB is optional)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (optional — not required for current feature set)
- Real-time: Socket.IO 4
- Frontend: React 19 + Vite 7 + Tailwind CSS 4
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (self-contained CJS bundle, ~2 MB)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API shapes)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks and Zod schemas
- `artifacts/api-server/src/lib/bibleParser.ts` — Telugu + KJV data loader
- `artifacts/api-server/src/routes/` — REST routes (bible, presentation, health)
- `artifacts/scripture-cast/src/pages/` — admin.tsx (control panel), display.tsx (OBS output)
- `data/bible/jsonFormat/json/` — 66 Telugu Bible JSON files
- `data/bible/kjv.json` — KJV English Bible dataset (4.7 MB)

## Architecture decisions

- **Single-service production**: Express serves API, Socket.IO, and the Vite-built frontend from one process. No separate static CDN needed.
- **Book IDs = Telugu names**: API routes use URL-encoded Telugu book names (e.g. `%E0%B0%AF%E0%B1%8B%E0%B0%B9%E0%B0%BE%E0%B0%A8%E0%B1%81` = "యోహాను"). English names are additive metadata.
- **esbuild bundling**: The server is compiled into a self-contained `dist/index.mjs`. No `node_modules` needed at runtime — important for minimal Docker images.
- **Data lives in the repo**: Both Telugu and KJV datasets (31,102 verses) are committed to `data/bible/`. No external data service needed.
- **Language mode at state level**: `language` (telugu/english/both) and `layout` (stack/side-by-side) are stored in Socket.IO broadcast state, not per-verse — they follow the presentation, not the content.

## Product

- **Admin panel** (`/admin`): Search Bible by English or Telugu. Navigate books → chapters → verses. Click to present or use keyboard arrows/space. Control language mode, bilingual layout, font, auto-scale, background, and transitions.
- **Display screen** (`/display`): OBS-ready full-screen output. Updates in real time via Socket.IO. Supports Telugu-only, English-only (KJV), and bilingual stack or side-by-side layouts with auto-scaling.

## User preferences

- Telugu book IDs must remain Telugu names throughout the API — no breaking change to canonical slugs.

## Gotchas

- Bible data is loaded by `bibleParser.ts` using `process.cwd()` — always start the server from the repo root.
- KJV "Song of Solomon" is keyed as "Solomon's Song" in the source dataset — handled via `TELUGU_TO_KJV_KEY` override in bibleParser.
- File `3.json` in the Telugu dataset is a Nehemiah duplicate and is silently skipped by the parser.
- `@replit/*` Vite plugins are fully conditional on `REPL_ID` — they are never loaded outside a Replit workspace.
- In production, Socket.IO runs on the same origin as the frontend — no CORS issues.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- `render.yaml` — one-click Render deployment config
- `Dockerfile` — multi-stage Docker build (production image ~5 MB + Bible data)
- `.env.example` — all supported environment variables documented
