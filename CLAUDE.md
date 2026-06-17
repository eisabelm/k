# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

**VideoStream** — a small full-stack TypeScript web app that displays a grid of
videos and plays them. It is a single Express server that serves both a JSON API
(`/api/*`) and a React single-page app from one process on **port 5000**.

The npm package is named `rest-express`; the deployed product/domain is
`ccrccgame.org`. Both names refer to this same app.

## Tech stack

- **Server:** Node.js (ESM) + Express 4, written in TypeScript, run via `tsx` in
  dev and bundled with `esbuild` for production.
- **Client:** React 18 + Vite 5, TypeScript, Wouter (routing), TanStack Query
  (data fetching), Tailwind CSS + shadcn/ui (Radix primitives), video.js (player).
- **Shared:** Drizzle ORM schema + Zod validation in `shared/`.
- **Database (configured, see caveat below):** PostgreSQL via Drizzle ORM and
  `@neondatabase/serverless`.

## Repository layout

```
client/            React SPA (Vite root is client/)
  index.html       SPA entry; loads /src/main.tsx
  src/
    main.tsx       React bootstrap
    App.tsx        Router (Wouter) + providers (TanStack Query, Toaster)
    pages/         home.tsx, video.tsx, not-found.tsx
    components/    nav-bar, search-bar, video-grid, video-card, video-player
    components/ui/ shadcn/ui primitives (generated; avoid hand-editing)
    lib/           queryClient.ts (TanStack Query config + apiRequest), utils.ts
    hooks/         use-toast, use-mobile
server/            Express backend
  index.ts         App entry: middleware, port 5000, dev Vite vs prod static
  routes.ts        API route registration (GET /api/videos, /api/videos/:id)
  storage.ts       IStorage interface + MemStorage (in-memory data store)
  db.ts            Drizzle + Neon Postgres pool (see caveat)
  vite.ts          Dev Vite middleware + prod static serving + log()
shared/
  schema.ts        Drizzle table `videos` + Zod insert schema + types
```

Path aliases (configured in `vite.config.ts` and `tsconfig.json`):
- `@/*`      → `client/src/*`
- `@shared/*`→ `shared/*`

## How it runs (request flow)

- `server/index.ts` creates the Express app, adds permissive CORS + an API
  request logger, registers routes, then:
  - **dev** (`NODE_ENV !== production`): mounts Vite in middleware mode so the
    client is served + HMR'd by the same Express server.
  - **prod**: serves the built client from `dist/public` and falls through to
    `index.html` for SPA routes.
- The server always listens on `0.0.0.0:5000`. The client calls relative
  `/api/...` URLs, so no separate API host/port is needed.

## Data layer — IMPORTANT caveat

There are **two** data mechanisms in the tree and they are not both wired up:

- `server/storage.ts` exports a singleton `storage = new MemStorage()` that holds
  videos **in memory** and seeds ~12 sample videos at startup. **This is what the
  API actually uses today** (`server/routes.ts` imports `storage`).
- `server/db.ts` + `drizzle.config.ts` + `shared/schema.ts` define a real
  PostgreSQL `videos` table via Drizzle. **Nothing imports `db.ts`**, so the
  database is configured but unused at runtime.

Implications when making changes:
- Data does **not** persist across restarts; `views` is always 0 and there is no
  create/update path exposed via the API (only `GET` routes exist).
- To switch to real persistence, add a Drizzle-backed implementation of the
  `IStorage` interface (`getAllVideos`, `searchVideos`, `getVideo`, `createVideo`)
  in `storage.ts`, swap the exported `storage` singleton, and ensure
  `DATABASE_URL` is set. `server/db.ts` throws at import time if it is missing.
- Keep `shared/schema.ts` as the single source of truth for the data shape; both
  the client (`@shared/schema` types) and any DB code depend on it.

## API

Defined in `server/routes.ts`:

| Method | Path               | Notes                                              |
|--------|--------------------|----------------------------------------------------|
| GET    | `/api/videos`      | All videos, or filtered via `?search=<query>`      |
| GET    | `/api/videos/:id`  | Single video by numeric id; 404 if not found       |

When adding endpoints, register them in `registerRoutes` and back them with the
`IStorage` interface rather than touching the data store directly.

## Commands

```bash
npm run dev      # Start dev server (tsx server/index.ts) on :5000, with Vite HMR
npm run build    # vite build (client → dist/public) + esbuild (server → dist/index.js)
npm run start    # Production: NODE_ENV=production node dist/index.js
npm run check    # tsc type-check (noEmit) — use this as the lint/CI gate
npm run db:push  # drizzle-kit push: sync shared/schema.ts to the database
```

There is **no test suite and no linter** configured. `npm run check` (TypeScript)
is the only automated correctness gate — run it after changes.

## Conventions

- **TypeScript strict mode** is on; keep code type-clean (`npm run check` passes).
- **ESM everywhere** (`"type": "module"`). Use `import`/`export`, not `require`,
  in source. (Config files like `ecosystem.config.js`/`postcss.config.js` are the
  exception.)
- **Imports:** use the `@/` and `@shared/` aliases instead of long relative paths.
- **Server responses:** JSON; errors as `{ message }` with an appropriate status.
  A central error-handling middleware in `index.ts` formats thrown errors.
- **Data access goes through `IStorage`** — components/routes should not assume a
  specific backend.
- **UI:** Tailwind utility classes + shadcn/ui components in
  `client/src/components/ui/`. Treat the `ui/` directory as generated; prefer
  composing over editing it. Theme tokens come from `theme.json` (Replit shadcn
  theme plugin) and `tailwind.config.ts`.
- **Routing:** client uses Wouter (`<Route path="/video/:id">`); server SPA
  fallback serves `index.html` for unknown non-API paths.
- **Data fetching:** use TanStack Query. The default `queryFn`
  (`client/src/lib/queryClient.ts`) treats the `queryKey` as URL segments joined
  by `/`, so `queryKey: ['/api/videos', search]` fetches `/api/videos/<search>`.

## Deployment

This repo carries config for multiple deploy targets:

- **Replit / Cloud Run** (`.replit`): dev via `npm run dev`; deploy builds with
  `npm run build` and runs `npm run start`. Maps local port 5000 → external 80.
- **Raspberry Pi (Apache2 + systemd)** — the primary production target for
  `ccrccgame.org`:
  - `deploy.sh` builds, copies the client to `/var/www/html/ccrccgame`, the
    backend to `/var/www/videostream`, installs the `videostream.service` systemd
    unit (Node backend on :5000), and configures Apache (`ccrccgame.org.conf`) to
    serve the SPA and reverse-proxy `/api` → `localhost:5000`.
  - `videostream.service` / `ecosystem.config.js` (PM2 alternative) run the
    backend; logs go to `/var/www/videostream/logs/`.
  - `videostream.nginx.conf` is an nginx alternative to the Apache config.
  - `CLOUDFLARE_SETUP.md` covers DNS/SSL (Cloudflare proxied, Full SSL).
- `build.bat` / `deploy.bat` are Windows helpers.

Note: the top-level `etc/`, `home/`, and `var/` directories are **snapshots of
deployed config files** from the Pi (copies of the service/Apache/deploy files),
not part of the app build. Edit the canonical files at the repo root, not these
copies.

## Environment variables

- `DATABASE_URL` — required by `server/db.ts` and `drizzle.config.ts` (they throw
  if unset). Only needed once the DB path is actually wired in; the app currently
  runs on `MemStorage` without it.
- `NODE_ENV` — `production` selects static serving + prod behavior; otherwise dev
  Vite middleware is used.
- `PORT` — referenced by the systemd/PM2 configs, but `server/index.ts`
  **hardcodes 5000**; change the source if you need a different port.

## Gotchas for assistants

- Don't assume DB persistence — the live data store is in-memory (`MemStorage`).
- The server port is hardcoded (5000), not read from `PORT` in `index.ts`.
- Only `GET` video endpoints exist; there is no auth, and CORS is wide open
  (`*`) by design for this app.
- `dist/`, `node_modules/`, and `server/public` are gitignored build output.
- No tests/linter — validate with `npm run check` and, when relevant, a manual
  `npm run dev` smoke test.
