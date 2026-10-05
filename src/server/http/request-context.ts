import { AsyncLocalStorage } from "node:async_hooks";
import { parse } from "hono/utils/cookie";

const requests = new AsyncLocalStorage<{ request: Request; env: CloudflareEnv }>();

export function withRequestContext<T>(request: Request, env: CloudflareEnv, run: () => T): T {
	return requests.run({ request, env }, run);
}

export function getRequestContext() {
	const context = requests.getStore();
	if (!context) throw new Error("No active HTTP request");
	return context;
}

export async function cookies() {
	const values = parse(getRequestContext().request.headers.get("Cookie") ?? "");
	return { get: (name: string) => values[name] === undefined ? undefined : { name, value: values[name] } };
}
