import { getRequestContext } from "@/server/http/request-context";
import { getNodeEnv } from "@/lib/runtime";

export function getEnv(): CloudflareEnv {
	return getNodeEnv() ?? getRequestContext().env;
}

export async function getEnvAsync(): Promise<CloudflareEnv> {
	return getEnv();
}
