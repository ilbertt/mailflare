import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import WebSocket from 'ws';

const base = new URL(process.env.MAILFLARE_LOCAL_URL ?? 'http://localhost:3000');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('This check only runs against localhost.');
const request = (path, init = {}, cookie) => fetch(new URL(path, base), {
 ...init, signal: AbortSignal.timeout(15_000),
 headers: { Origin: base.origin, ...Object.fromEntries(new Headers(init.headers)), ...(cookie ? { Cookie: cookie } : {}) },
});
async function json(path, init = {}, cookie) {
 const response = await request(path, init, cookie);
 const data = await response.json();
 assert.equal(response.ok, true, `${path}: ${response.status} ${JSON.stringify(data)}`);
 return data;
}
async function login(email) {
 const response = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'local-preview-password' }) });
 assert.equal(response.status, 200);
 assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
 assert.match(response.headers.get('set-cookie'), /Secure/i);
 return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
}
const admin = await login('admin@mailflare.test');
const member = await login('member@mailflare.test');
const me = await json('/api/auth/me', {}, admin);
assert.equal(me.runtime, 'cloudflare', 'Use the Cloudflare production preview, not the Node server.');
assert.equal(me.user.isPrimaryAdmin, true);
const { domain } = await json('/api/domains/local-domain', {}, admin);
assert.equal(domain.hostname, 'mailflare.test');
assert.equal(domain.sendingProvider, 'cloudflare', 'Keep the fixture on the simulated local Email binding for this check.');
assert.ok((await json('/api/messages/counts', {}, admin)).counts.folders.inbox.total > 0);
assert.ok(Array.isArray((await json('/api/messages/navigation?folder=inbox', {}, admin)).messages));
assert.equal((await request('/api/accounts', {}, member)).status, 403);
assert.equal((await request('/api/messages/local-member-message', {}, admin)).status, 404);
assert.equal((await request('/api/messages/local-received', {}, member)).status, 404);
assert.equal((await request('/api/seed', { method: 'POST' })).status, 403, 'Production seeding endpoint must remain disabled.');
assert.equal((await request('/api/no-such-route')).status, 404);
console.log('PASS production Worker, secure cookies, roles, and mailbox isolation');

for (const path of ['/inbox/local-received', '/calendar', '/settings/account', '/c/local-admin/preview-meeting']) {
 const response = await request(path, { headers: { Accept: 'text/html' } });
 assert.equal(response.status, 200); assert.match(await response.text(), /id="root"/);
 assert.match(response.headers.get('content-security-policy'), /default-src/);
}
const attachment = await request('/api/messages/local-received/attachments/local-attachment', {}, admin);
assert.equal(attachment.status, 200); assert.match(await attachment.text(), /local R2 bucket/);
assert.equal((await json('/api/public/booking/local-booking')).event.id, 'local-booking');
console.log('PASS SPA deep links, public booking, and seeded R2 attachment');

const draft = await json('/api/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mailboxId: 'local-admin-mailbox', from: 'admin@mailflare.test', to: 'recipient@example.test', subject: 'Local verification draft', text: 'Draft persistence check' }) }, admin);
try {
 const id = draft.draft.id;
 const uploaded = new FormData(); uploaded.append('attachments', new File(['local upload'], 'check.txt', { type: 'text/plain' }));
 const files = await json(`/api/drafts/${id}/attachments`, { method: 'POST', body: uploaded }, admin);
 assert.equal(files.attachments[0].filename, 'check.txt');
 const restored = await json(`/api/drafts/${id}`, {}, admin);
 assert.equal(restored.draft.subject, 'Local verification draft');
 const downloaded = await request(`/api/messages/${id}/attachments/${files.attachments[0].id}`, {}, admin);
 assert.equal(await downloaded.text(), 'local upload');
} finally {
 await json(`/api/drafts/${draft.draft.id}`, { method: 'DELETE' }, admin);
}
console.log('PASS draft persistence and multipart upload/download through D1 and R2');

const sent = await json('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mailboxId: 'local-admin-mailbox', from: 'admin@mailflare.test', to: 'recipient@example.test', subject: 'Local outbound check', text: 'Sent through the simulated local Cloudflare Email binding.' }) }, admin);
const sentMessage = await json(`/api/messages/${sent.messageId}`, {}, admin);
assert.equal(sentMessage.message.status, 'sent');
console.log('PASS simulated outbound email and Sent persistence');

await new Promise((resolve, reject) => {
 const url = new URL('/api/realtime', base); url.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
 const socket = new WebSocket(url, { headers: { Cookie: admin, Origin: base.origin }, handshakeTimeout: 10_000 });
 socket.once('error', reject); socket.once('open', () => { socket.close(); resolve(); });
});
console.log('PASS authenticated realtime Durable Object');

const subject = `Local inbound check ${crypto.randomUUID()}`;
const inbound = new URL('/cdn-cgi/local/email', base);
inbound.searchParams.set('from', 'sender@example.test'); inbound.searchParams.set('to', 'admin@mailflare.test');
const raw = ['From: sender@example.test', 'To: admin@mailflare.test', `Subject: ${subject}`, `Message-ID: <${crypto.randomUUID()}@example.test>`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', '', 'Delivered through the local email handler, R2, and inbound queue.'].join('\r\n');
const triggered = await request(inbound, { method: 'POST', body: raw });
assert.equal(triggered.ok, true, await triggered.text());
let delivered = false;
for (let attempt = 0; attempt < 25; attempt++) {
 const data = await json('/api/messages?folder=inbox', {}, admin);
 if (data.messages?.some(message => message.subject === subject)) { delivered = true; break; }
 await delay(400);
}
assert.equal(delivered, true, 'Inbound queue did not deliver the simulated email to D1.');
console.log('PASS inbound email → R2 → queue → D1');

const cron = await request('/cdn-cgi/local/scheduled?cron=*/5%20*%20*%20*%20*&format=json');
assert.equal(cron.ok, true);
assert.equal((await cron.json()).outcome, 'ok');
console.log('PASS scheduled maintenance handler');
console.log('Local Cloudflare preview checks passed.');
