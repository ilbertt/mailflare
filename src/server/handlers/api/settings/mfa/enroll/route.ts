import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/http/request";
import { verifyPassword } from "@/lib/auth/password";
import { beginMfaEnrollment } from "@/lib/auth/mfa";
import { mfaEnrollSchema } from "@/lib/validators";

/** Re-checks the password, then returns a new secret with its QR code. */
export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;
	const parsed = mfaEnrollSchema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: "Enter your password" }, { status: 400 });
	if (!verifyPassword(parsed.data.password, auth.user.passwordHash)) {
		return ApiResponse.json({ error: "Password is incorrect" }, { status: 400 });
	}
	if (auth.user.totpEnabled) {
		return ApiResponse.json({ error: "Two-factor authentication is already on" }, { status: 400 });
	}
	return ApiResponse.json(await beginMfaEnrollment(env, auth.user), { headers: { "Cache-Control": "no-store" } });
}

export type POSTInput = z.input<typeof mfaEnrollSchema>;
