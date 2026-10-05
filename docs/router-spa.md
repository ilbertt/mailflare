# SPA and API architecture

Mailflare uses TanStack Router with Vite, React Query, and a Hono API. Cloudflare and Node run the same HTTP handlers, with the existing platform adapters for storage, mail, queues, and realtime. This migration changes no persisted tables or SQL migrations.

## UI routing

`src/routes` contains file-based route declarations. Every module defines one `RouteComponent`, which delegates to a screen in `src/components/screens`. Supporting UI, hooks, types, and helpers stay outside the route directory. `src/routeTree.gen.ts` is generated with `npm run routes:generate`; the Vite plugin updates it during development and splits routes into chunks.

Underscore-prefixed layouts are pathless. Trailing underscores keep detail pages outside same-URL list pages when the original layout did not nest them. All existing URLs, including message folders, account settings, `/book` and `/c` booking links, remain available. Shared message screens receive their parameters from the typed route wrapper.

Protected layout routes check sessions in `beforeLoad`, redirect unauthorized users, and enforce admin/setup requirements before mounting screens. Backend handlers remain responsible for authorization. Public login supports adding another account, cookies remain HTTP-only, and browser Bearer tokens remain a fallback.

## API contracts

`src/server/api.ts` registers HTTP handlers from `src/server/handlers`. Its inferred `AppType` is imported **as a type** into `src/lib/api/client.ts`; server code and secrets do not enter the browser bundle. `ApiRequest` connects JSON inputs to the existing backend validators and parsers. `ApiResponse.json` carries the actual payload, status, and JSON serialization into Hono RPC inference, including serialized dates. The adapter also includes authentication, malformed JSON, and internal errors returned by the shared HTTP boundary.

```tsx
const response = await apiRequest('/api/settings/time-zone', {
  method: 'PATCH',
  json: { timeZone: 'Europe/Zurich' },
});
const settings = await readApiJson(response);
// settings.timeZone is inferred from the server response.
```

Paths, methods, dynamic parameters, JSON inputs, and response fields are checked. Query strings retain the existing string/URLSearchParams behavior; use objects where practical. Multipart requests use FormData and typed form-building helpers; binary downloads and SSE retain their native response handling. `readApiJson` throws for HTTP errors. `readApiResult` preserves non-success outcomes for MFA and MX conflict workflows and converts validation errors into displayable strings.

Add endpoints to the server chain and client endpoint map together. Negative compile-time assertions in `tests/types/api-contract.ts` check that unknown paths/methods, missing parameters, incorrect bodies, and unsafe response assumptions fail type checking. `tests/spa-api.test.mjs` exercises actual serialization, authentication, uploads, request isolation, protocol dispatch, and route structure.

## Builds and deployment

- `npm run dev`: Vite frontend and local Cloudflare bindings.
- `npm run dev:node`: Vite on port 3000 proxies HTTP/WebSockets to the Node backend on 3001; backend changes rebuild and restart it. SMTP is disabled by default in development.
- `npm run build`: type-check, generate routes, and build `dist/client` plus the complete Worker. Wrangler uses the Cloudflare plugin's generated configuration.
- `npm run build:node`: type-check, generate routes, build `dist/client`, and bundle `dist/server.mjs`.
- `npm run start:node`: serve the SPA and API with Node, applying the existing migration history at startup.

Cloudflare ASSETS uses SPA fallback and runs the Worker first so API failures cannot turn into HTML. Node serves static assets and falls back to the SPA for browser navigation. Email, queue, scheduled, and Durable Object handlers remain in `worker.ts`. No deployment was performed by this migration.

Turnstile's public build-time setting is `VITE_TURNSTILE_SITE_KEY` in `.env.local` or the build environment. The server secret remains `TURNSTILE_SECRET_KEY` in runtime configuration. Existing installations should rename the previous `NEXT_PUBLIC_TURNSTILE_SITE_KEY` build variable.

References: [TanStack Router with Vite](https://tanstack.com/router/latest/docs/installation/with-vite), [authenticated routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes), [Hono RPC](https://hono.dev/docs/guides/rpc), and [Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers).
