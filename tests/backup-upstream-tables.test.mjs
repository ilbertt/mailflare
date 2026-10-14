import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const directory = mkdtempSync(join(root, "node_modules", "mailflare-backup-test-"));
after(() => rmSync(directory, { recursive: true, force: true }));
await build({
	stdin: {
		contents: `
			export { SqliteDatabase } from "./server/runtime/sqlite-database";
			export { applyMigrations } from "./server/runtime/migrate";
			export { exportDatabaseRecords, restoreDatabaseRecords } from "./src/lib/backups/export";
			export { BACKUP_TABLE_GROUPS } from "./src/lib/backups/table-groups";
		`,
		resolveDir: root,
		loader: "ts",
	},
	outfile: join(directory, "entry.mjs"),
	bundle: true,
	platform: "node",
	format: "esm",
	packages: "external",
	logLevel: "silent",
});
const { SqliteDatabase, applyMigrations, exportDatabaseRecords, restoreDatabaseRecords, BACKUP_TABLE_GROUPS } = await import(pathToFileURL(join(directory, "entry.mjs")).href);
const addedTables = ["push_subscriptions", "drive_items", "drive_shares", "drive_upload_parts"];
const migrations = join(root, "drizzle/migrations");
const oldMigrations = join(directory, "old-migrations");
mkdirSync(oldMigrations);
for (const file of readdirSync(migrations).filter((file) => file.endsWith(".sql") && file < "0054")) {
	copyFileSync(join(migrations, file), join(oldMigrations, file));
}

async function database(t, before = false) {
	const db = new SqliteDatabase(":memory:");
	t.after(() => db.db.close());
	await applyMigrations(db, before ? oldMigrations : migrations);
	db.db.exec(`
		INSERT INTO users (id, email, password_hash, name, created_at) VALUES ('u', 'u@example.com', 'hash', 'User', 1);
		INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES ('s', 'u', 'token-hash', 9999999999, 1);
	`);
	return db;
}

function seedAddedTables(db) {
	db.db.exec(`
		INSERT INTO push_subscriptions (id, user_id, session_id, endpoint, p256dh, auth, created_at, updated_at)
		VALUES ('p', 'u', 's', 'https://push.example/subscription', 'key', 'auth', 1, 1);
		INSERT INTO drive_items (id, owner_id, kind, name, created_at, updated_at) VALUES ('folder', 'u', 'folder', 'Folder', 1, 1);
		INSERT INTO drive_items (id, owner_id, parent_id, kind, name, upload_id, created_at, updated_at)
		VALUES ('file', 'u', 'folder', 'file', 'File', 'upload', 1, 1);
		INSERT INTO drive_shares (id, item_id, user_id, created_at) VALUES ('share', 'file', 'u', 1);
		INSERT INTO drive_upload_parts (item_id, part_number, etag) VALUES ('file', 1, 'etag');
	`);
}

const decode = (content) => JSON.parse(new TextDecoder().decode(content));
const encode = (document) => new TextEncoder().encode(JSON.stringify(document));

test("backup and restore work before the new tables are migrated", async (t) => {
	const db = await database(t, true);
	const backup = await exportDatabaseRecords(db);
	for (const table of addedTables) assert.deepEqual(decode(backup).tables[table], []);
	await restoreDatabaseRecords(db, backup);
	assert.equal(db.db.prepare("SELECT id FROM users").get().id, "u");
	assert.equal(db.db.prepare("SELECT id FROM sessions").get().id, "s");
});

test("new persisted rows round-trip in foreign-key dependency order", async (t) => {
	const db = await database(t);
	seedAddedTables(db);
	const backup = await exportDatabaseRecords(db);
	const before = decode(backup);
	for (const table of addedTables) {
		assert.ok(before.tables[table].length > 0);
		assert.equal(BACKUP_TABLE_GROUPS.flatMap((group) => group.tables).filter((item) => item === table).length, 1);
	}
	await restoreDatabaseRecords(db, backup);
	const restored = decode(await exportDatabaseRecords(db));
	for (const table of addedTables) assert.deepEqual(restored.tables[table], before.tables[table]);
	assert.deepEqual(db.db.pragma("foreign_key_check"), []);
});

test("older full backup documents restore into the migrated schema", async (t) => {
	const source = await database(t, true);
	const legacy = decode(await exportDatabaseRecords(source));
	delete legacy.includedTables;
	for (const table of addedTables) delete legacy.tables[table];
	const target = await database(t);
	seedAddedTables(target);
	await restoreDatabaseRecords(target, encode(legacy));
	for (const table of addedTables) assert.equal(target.db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count, 0);
	assert.equal(target.db.prepare("SELECT id FROM users").get().id, "u");
	assert.deepEqual(target.db.pragma("foreign_key_check"), []);
});

test("unmigrated restore refuses new table data before deleting existing records", async (t) => {
	const source = await database(t);
	seedAddedTables(source);
	const backup = decode(await exportDatabaseRecords(source));
	const target = await database(t, true);
	for (const table of addedTables) {
		const document = structuredClone(backup);
		for (const other of addedTables) if (other !== table) document.tables[other] = [];
		await assert.rejects(restoreDatabaseRecords(target, encode(document)), /Apply pending database migrations/);
		assert.equal(target.db.prepare("SELECT id FROM users").get().id, "u");
	}
});
