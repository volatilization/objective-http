# AGENTS.md

## Development Commands

| Command                 | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `npm test`              | Run tests with coverage (Node.js built-in test runner)                                  |
| `npm run lint`          | Lint with ESLint (flat config, ignores `dist/`, `.configs/`, `.agents/`, `.scratches/`) |
| `npm run build`         | Production bundle via webpack (outputs `dist/index.js` as UMD)                          |
| `npm run release`       | Release via `release-it` (runs lint → test:coverage → build → publish)                  |
| `npm run test:coverage` | Run tests + enforce `COVERAGE_MIN_PERCENT` from `.env`/`.common.env`                    |

## Project Structure

- **`src/js/`** — Source code (CommonJS)
    - `index.js` — Exports `{ server, client }`
    - `server/` — Server-side: `Server`, `endpoint`, `request`, `response`
    - `client/` — Client-side: `request`, `response`
- **`test/e2e/`** — End-to-end tests (start real HTTP servers)
- **`.configs/`** — Tool configs: `eslint.mjs`, `webpack.mjs`, `release-it.mjs`, `prettier.mjs`
- **`dist/`** — Build output (gitignored, created by `npm run build`)

## Architecture (Verified from Code)

### Server

- **Server** (`src/js/server/server.js`) — Creates HTTP server, handles routing, lifecycle (`start()`/`stop()`)
- **Endpoints** (`src/js/server/endpoint/`) — Collection of endpoints, each with:
    - `route: { method, path }`
    - `handle({ query, headers, body })` — async, returns `{ status, body }`
- **Request types** (`src/js/server/request/`) — `serverRequest` (base), `serverChunkRequest` (raw), `serverJsonRequest` (JSON parsing)
- **Response types** (`src/js/server/response/`) — `serverResponse` (base), `serverChunkResponse`, `serverJsonResponse`, `serverErrorResponse`
- **Error handling** — Custom `errorResponse` object with `send()`; checks `error.cause.code` for `ENDPOINT_NOT_IMPLEMENTED` (501), `INVALID_REQUEST` (400)

### Client

- **Request objects** (`src/js/client/request/`) — `clientChunkRequest`, `clientJsonRequest`
- **Response objects** (`src/js/client/response/`) — `clientChunkResponse`, `clientJsonResponse`
- Usage: Spread request object, set `url`, `options`, `body`, call `.send()` → returns `{ status, headers, body, ok() }`

## Key Conventions

- **Object composition** — Objects are composed via spread (`...base`, then override `origin`, `send()`, etc.)
- **No `autoconfig`** — Not present in codebase; servers are configured manually
- **No `Handler` classes** — Endpoints are plain objects with `route` + `handle`
- **Coverage threshold** — Set via `COVERAGE_MIN_PERCENT` in `.env` or `.common.env`
- **Release branches** — `master` or `release/v*` only (enforced by `release-it`)
- **Pre-release hooks** — `build:cleanup` → `lint` → `test:coverage`; post-release cleans `dist/`

## Testing Notes

- E2E tests start real servers on ports 8080/8090
- Run single test file: `node --test test/e2e/server.js` for server testing or `node --test test/e2e/client.js` for client
- Coverage excludes `/test/` and all `index.js` files (see `.scripts/coverage.sh`)
