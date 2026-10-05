import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { themeBootstrapScript } from "./src/components/theme-utils";
import { sidebarBootstrapScript } from "./src/components/sidebar-state-utils";

export default defineConfig(() => ({
	resolve: { tsconfigPaths: true },
	build: { outDir: process.env.MAILFLARE_RUNTIME === "node" ? "dist/client" : "dist" },
	server: { allowedHosts: ["mailflare.local", "mail.dev"], ...(process.env.MAILFLARE_RUNTIME === "node" ? { proxy: { "/api": { target: "http://127.0.0.1:3001", ws: true }, "/mcp": "http://127.0.0.1:3001", "/jmap": "http://127.0.0.1:3001", "/.well-known": "http://127.0.0.1:3001" } } : {}) },
	plugins: [
		{ name: "mailflare-bootstrap", transformIndexHtml: () => [{ tag: "script", children: sidebarBootstrapScript + "\n" + themeBootstrapScript, injectTo: "head-prepend" as const }] },
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		...(process.env.MAILFLARE_RUNTIME === "node" ? [] : [cloudflare({ remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === "true" })]),
	],
}));
