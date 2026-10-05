import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Database from 'better-sqlite3';

const bundle = JSON.parse(readFileSync(new URL('../src/lib/migrations/bundle.json', import.meta.url), 'utf8'));
test('the bundled bootstrap history produces the current persisted schema', () => {
 const db = new Database(':memory:');
 try {
  for (const migration of bundle.migrations) for (const statement of migration.statements) db.exec(statement);
  const columns = db.prepare('PRAGMA table_info(mailboxes)').all().map(column => column.name);
  for (const name of ['signature', 'auto_reply_enabled', 'auto_reply_subject', 'auto_reply_body']) assert.ok(columns.includes(name), name);
  for (const name of ['license_settings', 'auto_reply_deliveries', 'spam_token_stats', 'spam_reputation', 'spam_feedback']) assert.ok(db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?').get('table', name), name);
  db.exec("INSERT INTO users (id,email,password_hash,name,created_at) VALUES ('u','a@b.c','x','n',1)");
  db.exec("INSERT INTO domains (id,user_id,hostname,zone_id,created_at) VALUES ('d','u','ex.com','z',1)");
  db.exec("INSERT INTO mailboxes (id,user_id,domain_id,local_part,signature,auto_reply_enabled,auto_reply_subject,auto_reply_body,created_at) VALUES ('m','u','d','admin','sig',0,'Out of office','',1)");
  db.exec("INSERT INTO license_settings (id,instance_id,updated_at) VALUES ('default','inst',1)");
  db.exec("INSERT INTO auto_reply_deliveries (id,mailbox_id,recipient,sent_at) VALUES ('ar','m','x@y.z',1)");
 } finally { db.close(); }
});
