import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { getPlatformProxy, unstable_readConfig } from 'wrangler';

// This directory is intentionally separate from ordinary dev and remote state.
const statePath = resolve('.wrangler/local-preview');
await mkdir(statePath, { recursive: true });
const entry = resolve(statePath, 'fixture.mjs');
await build({ entryPoints: ['scripts/local-preview-fixture.ts'], outfile: entry,
 bundle: true, platform: 'node', format: 'esm', packages: 'external',
 tsconfig: 'tsconfig.json', logLevel: 'silent' });
const { seedLocalPreview } = await import(pathToFileURL(entry).href);
const config = unstable_readConfig({ config: 'wrangler.jsonc' });
const seedConfig = resolve(statePath, 'seed-wrangler.json');
// The proxy only needs D1 and R2; the actual preview exports and runs the DO.
await writeFile(seedConfig, JSON.stringify({ name: config.name,
 compatibility_date: config.compatibility_date, compatibility_flags: config.compatibility_flags,
 d1_databases: config.d1_databases, r2_buckets: config.r2_buckets }));
const platform = await getPlatformProxy({ configPath: seedConfig,
 persist: { path: resolve(statePath, 'v3') }, remoteBindings: false });
try {
 await seedLocalPreview(platform.env);
 console.log('Local Cloudflare preview prepared. Existing preview data is preserved.');
 console.log('Admin: admin@mailflare.test / local-preview-password');
 console.log('Member: member@mailflare.test / local-preview-password');
 console.log('Storage: .wrangler/local-preview (local D1, R2, and Durable Objects)');
} finally {
 await platform.dispose();
}
