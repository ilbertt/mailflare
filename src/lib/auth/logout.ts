import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { clearClientSessionToken, setClientSessionToken } from "@/lib/auth/client";

/** Returns true when another signed-in account on this browser took over. */
export async function logoutClientSession(): Promise<boolean> {
	let nextToken: string | undefined;
	try {
		const response = await apiRequest("/api/auth/logout", { method: "POST", redirectOnUnauthorized: false });
		nextToken = (await readApiResult(response).catch(() => null))?.token;
	} catch {
		// Local logout must complete even when the server request is unavailable.
	} finally {
		clearClientSessionToken();
	}
	if (!nextToken) return false;
	setClientSessionToken(nextToken);
	return true;
}
