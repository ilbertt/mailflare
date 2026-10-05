import { apiRequest } from '../../src/lib/api/request';
import { readApiJson, readApiResult } from '../../src/lib/api/json';
import { apiClient } from '../../src/lib/api/client';
import { router } from '../../src/router';

// This function is checked by tsc, never executed. Each negative assertion must fail.
async function verifyContracts() {
 const result = await readApiJson(await apiRequest('/api/auth/me', { method: 'GET' }));
 const id: string = result.user.id;
 // @ts-expect-error Server response contains no password hash.
 void result.user.passwordHash;
 const settings = await readApiJson(await apiRequest('/api/settings/time-zone', { method: 'PATCH', json: { timeZone: null } }));
 const timeZone: string | null = settings.timeZone;
 // @ts-expect-error Paths must exist in the server.
 apiRequest('/api/not-real', { method: 'GET' });
 // @ts-expect-error Method is absent on this path.
 apiRequest('/api/auth/me', { method: 'POST' });
 // @ts-expect-error Dynamic route params are required.
 apiRequest('/api/messages/:messageId', { method: 'GET' });
 // @ts-expect-error Dynamic params use the declared server name.
 apiRequest('/api/messages/:messageId', { method: 'GET', param: { id } });
 // @ts-expect-error JSON values use validator input types.
 apiRequest('/api/settings/time-zone', { method: 'PATCH', json: { timeZone: 42 } });
 // @ts-expect-error Unknown body fields cannot silently cross the boundary.
 apiRequest('/api/auth/login', { method: 'POST', json: { email: 'x@y.test', password: 'password', admin: true } });
 // @ts-expect-error A request body cannot be omitted for login.
 apiRequest('/api/auth/login', { method: 'POST' });
 const license = await readApiJson(await apiClient.api.licenses.$get());
 // @ts-expect-error Dates in JSON are strings, not Date objects.
 const activatedAt: Date | null = license.license.activatedAt;
 const login = await readApiResult(await apiRequest('/api/auth/login', { method: 'POST', json: { email: 'x@y.test', password: 'password' } }));
 const challenge: string | undefined = login.challengeToken;
 // @ts-expect-error Failure outcomes mean a session token is not guaranteed.
 const token: string = login.token;
 const counts = await readApiResult(await apiRequest('/api/messages/counts', { method: 'GET' }));
 // @ts-expect-error The HTTP boundary can reject a route before its success handler runs.
 const guaranteedCounts: object = counts.counts;
 void guaranteedCounts;
 // @ts-expect-error Public booking requires string contact fields.
 apiRequest('/api/public/booking/:eventId', { method: 'POST', param: { eventId: 'meeting' }, json: { startsAt: '2026-10-06T10:00:00Z', name: 'Guest', email: 42 } });
 // @ts-expect-error Domain routing updates use the server validator fields.
 apiRequest('/api/routing-rules/domain/:id', { method: 'PATCH', param: { id }, json: { action: 'invented-action' } });
 // @ts-expect-error File-based routes provide a checked destination union.
 router.navigate({ to: '/not-a-screen' });
 return { id, timeZone, activatedAt, challenge, token };
}
void verifyContracts;
