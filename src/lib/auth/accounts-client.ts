import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { setClientSessionToken } from "@/lib/auth/client";

export type BrowserAccount = {
	userId: string;
	email: string;
	name: string;
	hasAvatar: boolean;
	active: boolean;
};

export async function fetchBrowserAccounts(): Promise<BrowserAccount[]> {
	try {
		const res = await apiRequest("/api/auth/accounts", { method: "GET", redirectOnUnauthorized: false, cache: "no-store" });
		if (!res.ok) return [];
		return (await readApiResult(res)).accounts;
	} catch {
		return [];
	}
}

/** Returns an error message, or null once the switch succeeded. */
export async function switchBrowserAccount(userId: string): Promise<string | null> {
	const res = await apiRequest("/api/auth/switch", { method: "POST", redirectOnUnauthorized: false, headers: { "Content-Type": "application/json" }, json: { userId } });
	const data = await readApiResult(res);
	if (!res.ok || !data.token) return data.error ?? "Could not switch account";
	setClientSessionToken(data.token);
	return null;
}
