import { spawn } from 'node:child_process';
import { context } from 'esbuild';
import { createServer } from 'vite';
import { serverBuildOptions } from './server-build-options.mjs';

process.env.MAILFLARE_RUNTIME = 'node';
const bundler = await context(serverBuildOptions);
await bundler.rebuild();
await bundler.watch();
const backend = spawn(process.execPath, ['--watch', 'dist/server.mjs'], {
 env: { ...process.env, PORT: '3001', SMTP_INBOUND_PORT: process.env.SMTP_INBOUND_PORT ?? '0' }, stdio: 'inherit',
});
const frontend = await createServer({ server: { port: 3000, strictPort: true } });
await frontend.listen();
frontend.printUrls();
async function stop() { backend.kill(); await frontend.close(); await bundler.dispose(); process.exit(); }
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
backend.once('exit', stop);
