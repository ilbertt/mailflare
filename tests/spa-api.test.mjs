import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import ts from 'typescript';

const root = process.cwd();
const dir = mkdtempSync(join(root, 'node_modules', 'mailflare-spa-test-'));
await build({ stdin: { contents: `
 export { app, isBackendPath } from './src/server/app';
 export { default as worker } from './worker';
 export { apiRequest } from './src/lib/api/request';
 export { readApiJson, readApiResult } from './src/lib/api/json';
 export { SqliteDatabase } from './server/runtime/sqlite-database';
 export { FileBucket } from './server/runtime/file-bucket';
 export { applyMigrations } from './server/runtime/migrate';
 export { hashPassword } from './src/lib/auth/password';
`, resolveDir: root, sourcefile: 'spa-test-entry.ts' }, outfile: join(dir,'entry.mjs'), bundle: true, platform: 'node', format: 'esm', packages: 'external', tsconfig: join(root,'tsconfig.json'), plugins: [{ name: 'test-durable-object', setup(build) { build.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: 'cloudflare:workers', namespace: 'test-workers' })); build.onLoad({ filter: /.*/, namespace: 'test-workers' }, () => ({ contents: 'export class DurableObject {}', loader: 'js' })); } }], logLevel: 'silent' });
const { app, worker, apiRequest, readApiJson, readApiResult, SqliteDatabase, FileBucket, applyMigrations, hashPassword } = await import(pathToFileURL(join(dir,'entry.mjs')));
test.after(() => rmSync(dir, { recursive: true, force: true }));

async function fixture(t, username = 'owner') {
 const database = new SqliteDatabase(':memory:');
 const bucketDir = mkdtempSync(join(tmpdir(),'mailflare-spa-bucket-'));
 t.after(() => { database.db.close(); rmSync(bucketDir, { recursive: true, force: true }); });
 await applyMigrations(database, join(root, 'drizzle/migrations'));
 database.db.prepare('INSERT INTO users (id,email,password_hash,name,role,is_primary_admin,created_at) VALUES (?,?,?,?,?,?,?)').run(username, `${username}@example.test`, hashPassword('test-password'), username, 'admin', 1, 1);
 database.db.exec(`INSERT INTO domains (id,user_id,hostname,zone_id,status,created_at) VALUES ('domain','${username}','example.test','manual','active',1);
 INSERT INTO mailboxes (id,user_id,domain_id,local_part,created_at) VALUES ('mailbox','${username}','domain','${username}',1);`);
 const env = { DB: database, BUCKET: new FileBucket(bucketDir), MAILFLARE_RUNTIME: 'node' };
 const fetchApi = (path, options) => app.fetch(new Request(`http://mailflare.test${path}`, options), env);
 const login = await fetchApi('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${username}@example.test`, password:'test-password' }) });
 assert.equal(login.status, 200);
 assert.match(login.headers.get('set-cookie'), /ep_session=.*HttpOnly.*SameSite=Lax/i);
 const data = await login.json();
 return { env, database, fetchApi, token: data.token, cookie: `ep_session=${data.token}` };
}

test('typed client serializes JSON and params and preserves cookie/Bearer authentication', async t => {
 const { fetchApi, cookie, token } = await fixture(t);
 t.mock.method(globalThis, 'fetch', (input, init) => fetchApi(new URL(input, 'http://mailflare.test').pathname + new URL(input, 'http://mailflare.test').search, { ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), Cookie: cookie } }));
 const current = await readApiJson(await apiRequest('/api/auth/me', { method:'GET' }));
 assert.equal(current.user.id, 'owner');
 assert.equal('passwordHash' in current.user, false);
 const draft = await readApiJson(await apiRequest('/api/drafts', { method:'POST', headers: { Authorization: `Bearer ${token}` }, json: { mailboxId:'mailbox', from:'owner@example.test', to:'recipient@example.test', subject:'Typed draft', text:'Hello' } }));
 assert.ok(draft.draft.id);
 const patched = await readApiJson(await apiRequest('/api/drafts/:id', { method:'PATCH', param:{id:draft.draft.id}, headers:{Authorization:`Bearer ${token}`}, json:{mailboxId:'mailbox',from:'owner@example.test',subject:'Updated'} }));
 assert.equal(patched.draft.id,draft.draft.id);
 const form = new FormData(); form.append('attachments', new File(['hello'], 'hello.txt', { type:'text/plain' }));
 const upload = await readApiJson(await apiRequest('/api/drafts/:id/attachments', { method:'POST', param:{id:draft.draft.id}, headers:{Authorization:`Bearer ${token}`}, body:form }));
 assert.equal(upload.attachments[0].filename,'hello.txt');
 const binary = await apiRequest('/api/messages/:messageId/attachments/:attachmentId', { method:'GET', param:{messageId:draft.draft.id,attachmentId:upload.attachments[0].id} });
 assert.equal(binary.status,200); assert.equal(await binary.text(),'hello');
 const malformed = await fetchApi('/api/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
 assert.equal(malformed.status,400);
 const invalid = await readApiResult(await apiRequest('/api/auth/login', {method:'POST',json:{email:'invalid',password:''}}));
 assert.equal(typeof invalid.error,'string');
 const forbidden = await fetchApi('/api/drafts', {method:'POST',headers:{Cookie:cookie,Origin:'https://attacker.test','Content-Type':'application/json'},body:JSON.stringify({mailboxId:'mailbox'})});
 assert.equal(forbidden.status,403);
 const missing = await fetchApi('/api/does-not-exist');
 assert.equal(missing.status,404); assert.match(missing.headers.get('content-type'), /application\/json/);
 assert.match(missing.headers.get('x-robots-tag'), /noindex/);
 const jmap = await fetchApi('/.well-known/jmap'); assert.equal(jmap.status,301); assert.equal(new URL(jmap.headers.get('location')).pathname,'/jmap/session'); assert.equal((await fetchApi('/jmap/session')).status,401);
 const mcp = await fetchApi('/mcp'); assert.equal(mcp.status,401);
 const logout = await fetchApi('/api/auth/logout',{method:'POST',headers:{Cookie:cookie,Origin:'http://mailflare.test'}});
 assert.equal(logout.status,200); assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
 assert.equal((await fetchApi('/api/auth/me',{headers:{Cookie:cookie}})).status,401);
});

test('static message and booking endpoints take precedence over parameter routes', async t => {
 const { fetchApi, cookie } = await fixture(t);
 const counts = await fetchApi('/api/messages/counts', { headers: { Cookie: cookie } });
 assert.equal(counts.status, 200); assert.equal((await counts.json()).counts.folders.inbox.total, 0);
 const navigation = await fetchApi('/api/messages/navigation?folder=inbox', { headers: { Cookie: cookie } });
 assert.equal(navigation.status, 200); assert.deepEqual((await navigation.json()).messages, []);
 const settings = await fetchApi('/api/booking/settings', { method: 'PATCH', headers: { Cookie: cookie, Origin: 'http://mailflare.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'owner-preview' }) });
 assert.equal(settings.status, 200); assert.equal((await settings.json()).username, 'owner-preview');
});

test('request context isolates concurrent Worker environments and cookie sessions',async t=> {
 const a = await fixture(t,'first'); const b = await fixture(t,'second');
 const responses = await Promise.all([a.fetchApi('/api/auth/me',{headers:{Cookie:a.cookie}}),b.fetchApi('/api/auth/me',{headers:{Cookie:b.cookie}})]);
 assert.deepEqual(await Promise.all(responses.map(async r=>(await r.json()).user.id)),['first','second']);
 assert.equal((await a.fetchApi('/api/auth/me',{headers:{Cookie:b.cookie}})).status,401);
});

test('Worker serves SPA deep links through ASSETS and keeps API requests separate',async t=>{
 const {env}=await fixture(t); const seen=[];
 env.ASSETS={fetch:async req=>{seen.push(new URL(req.url).pathname);return new Response('<div id="root"></div>',{headers:{'Content-Type':'text/html'}});}};
 const ctx={waitUntil:()=>{}};
 for(const path of ['/inbox/msg-deep-link','/calendar','/c/person/meeting']) {
  const response=await worker.fetch(new Request(`http://mailflare.test${path}`),env,ctx);
  assert.equal(response.status,200);assert.match(await response.text(),/id="root"/);assert.match(response.headers.get('content-security-policy'),/default-src/);
 }
 assert.equal((await worker.fetch(new Request('http://mailflare.test/api/no-route'),env,ctx)).status,404);
 assert.equal((await worker.fetch(new Request('http://mailflare.test/api/realtime'),env,ctx)).status,426);
 assert.equal(seen.length,3);
});

test('every file-based UI route defines exactly one component and delegates to components',()=>{
 for(const file of readdirSync(join(root,'src/routes')).filter(f=>f.endsWith('.tsx'))){
  const source=ts.createSourceFile(file,readFileSync(join(root,'src/routes',file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const functions=source.statements.filter(ts.isFunctionDeclaration);
  assert.equal(functions.length,1,file);assert.equal(functions[0].name.text,'RouteComponent',file);
  assert.equal(source.statements.some(n=>ts.isImportDeclaration(n)&&n.moduleSpecifier.text.startsWith('@/components/')),true,file);
 }
});
