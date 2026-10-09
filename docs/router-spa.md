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

## Production-like local preview

`npm run local:preview` applies the committed migration history to an isolated local D1 database, adds sample data, builds the production SPA and Worker, and runs that bundle in workerd on [localhost:3000](http://localhost:3000). It uses the repository's Cloudflare compatibility flags, SPA asset handling, D1, R2, queues, rate-limit bindings, and `RealtimeHub` Durable Object. The production `/api/seed` endpoint stays disabled; fixtures are inserted by a local setup script.

| Account | Password | Access |
| --- | --- | --- |
| `admin@mailflare.test` | `local-preview-password` | Primary administrator, admin and support mailboxes |
| `member@mailflare.test` | `local-preview-password` | Regular user with a separate mailbox |

Sample data includes received, sent, draft, archived, spam, trash, and snoozed mail, an R2 attachment, a calendar event, and a [public booking page](http://localhost:3000/c/local-admin/preview-meeting). Preview state persists under `.wrangler/local-preview/v3`, separate from ordinary development and remote resources. Re-running setup adds missing fixtures and migrations without overwriting existing rows or user edits. The demo accounts and configuration are local fixtures; they are not a copy of a deployed database.

Commands:

- `npm run local:preview`: prepare data, rebuild, and start the preview. Stop any existing preview first.
- `npm run local:start`: restart the existing build with the same persistent data.
- `npm run local:setup`: apply migrations and prepare fixtures without starting the preview. Run with the preview stopped.
- `npm run local:check`: run acceptance checks against the running preview, including administrator/member access, secure cookies, static API route precedence, deep SPA links, public booking, draft persistence, multipart uploads/downloads, simulated outbound mail, realtime WebSockets, inbound email through R2 and the queue, and scheduled maintenance. Each run leaves a received and sent test message, and removes its temporary draft.

The preview forces remote bindings off. Cloudflare Email Sending is simulated locally; it does not deliver mail to real recipients. Inbound mail is injected through Cloudflare's local email endpoint, then processed by the actual Worker and queue consumer. Cron jobs require a manual trigger locally; `local:check` invokes the five-minute handler. AI inference, provider APIs, DNS/email routing setup, Turnstile, and deployed license settings require their corresponding service configuration and are not validated by these checks. No external credentials or Turnstile keys are supplied by the fixture. Existing `.dev.vars` and Vite environment files still apply, so use staging credentials when configuring integrations.

To match a specific deployment more closely, use its build-time public settings and staging runtime secrets, domain/provider configuration, and license. Never point the local fixture setup at remote storage. The helper and acceptance script default to the isolated preview; the acceptance script rejects non-loopback URLs.

Cloudflare references: [Vite production preview](https://developers.cloudflare.com/workers/local-development/vite-plugin/), [persistent local data](https://developers.cloudflare.com/workers/local-development/local-data/), and [local email routing](https://developers.cloudflare.com/email-service/local-development/routing/).

References: [TanStack Router with Vite](https://tanstack.com/router/latest/docs/installation/with-vite), [authenticated routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes), [Hono RPC](https://hono.dev/docs/guides/rpc), and [Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers).
