import { Hono } from "hono";
import { api } from "./api";
import type { ApiEnv } from "./http/handler";
import { withRequestContext } from "./http/request-context";
import { getSecurityHeaders } from "@/lib/security/headers";

export function isBackendPath(pathname: string): boolean {
	return pathname === "/api" || pathname.startsWith("/api/") || pathname === "/mcp" || pathname.startsWith("/mcp/") || pathname === "/jmap" || pathname.startsWith("/jmap/") || pathname.startsWith("/.well-known/");
}

export const app = new Hono<ApiEnv>();
app.use("*", async (context, next) => {
	await withRequestContext(context.req.raw, context.env, next);
	for (const { key, value } of getSecurityHeaders()) context.header(key, value);
	if (isBackendPath(new URL(context.req.url).pathname)) context.header("Cache-Control", "private, no-store");
});
app.onError((error, context) => {
	if (error.message === "Forbidden") return context.json({ error: "Forbidden" }, 403);
	if (error.message === "Unauthorized") return context.json({ error: "Unauthorized" }, 401);
	if (error instanceof SyntaxError) return context.json({ error: "Invalid JSON request" }, 400);
	console.error("HTTP request failed", error);
	return context.json({ error: "Internal server error" }, 500);
});
app.route("/", api);
app.all("*", (context) => context.json({ error: "Not found" }, 404));
