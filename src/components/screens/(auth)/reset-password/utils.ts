import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
export async function confirmPasswordReset(token: string, password: string): Promise<{ ok: boolean; error?: string }> {
	const res = await apiRequest("/api/auth/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20_000), json: { token, password }, authenticated: false });
	const data = await readApiResult(res).catch(() => ({ error: undefined }));
	return { ok: res.ok, error: typeof data.error === "string" ? data.error : undefined };
}
