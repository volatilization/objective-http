# AGENTS.md

## Development

- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **Release**: `npm run release`

## Architecture

- **Core**: Proxy classes for creating an HTTP server and client.
- **Server**:
  - `Server` class handles the lifecycle and routing.
  - `Endpoint` interface: `route` (object with `method` and `path`) and `handle(request)` (async).
  - `Handler` objects handle IO streams directly.
  - `autoconfig` provides a simplified server setup.
- **Client**:
  - `request` objects handle the request lifecycle.
  - `with(options)` sets request parameters.
  - `send()` executes the request.
  - `chunk` vs `json` handlers: `chunk` handles raw streams, `json` handles JSON body parsing/serialization.

## Key Concepts

- **Handlers**: The logic layer. They can be nested (e.g., `error` handlers wrapping `endpoint` handlers).
- **Routing**: Handlers can be single endpoints or `EndpointsHandler` (group of endpoints).
- **Request/Response**: Handlers receive/return objects that can be further wrapped (e.g., `JsonServerRequest` wraps `ChunkServerRequest`).
