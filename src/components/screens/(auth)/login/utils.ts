import { apiRequest } from "@/lib/api/request";
import { persistAuthSession } from "@/lib/auth/client";
import type { LoginResult } from "./types";

export async function submitLogin(form: FormData): Promise<{ ok: boolean; data: LoginResult }> {
	const res = await apiRequest("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20_000), json: {
			email: String(form.get("email") ?? ""),
			password: String(form.get("password") ?? ""),
			turnstileToken: String(form.get("turnstileToken") ?? ""),
		}, authenticated: false });

	return {
		ok: res.ok,
		data: await persistAuthSession(res),
	};
}

/** Second step: the challenge from the password step plus a TOTP or recovery code. */
export async function submitMfaCode(challengeToken: string, code: string): Promise<{ ok: boolean; data: LoginResult }> {
	const res = await apiRequest("/api/auth/mfa/verify", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20_000), json: { challengeToken, code }, authenticated: false });
	return { ok: res.ok, data: await persistAuthSession(res) };
}
