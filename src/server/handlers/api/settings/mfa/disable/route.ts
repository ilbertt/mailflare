import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { readJsonBody } from "@/lib/http/request";
import { verifyPassword } from "@/lib/auth/password";
import { disableMfa, verifySecondFactor } from "@/lib/auth/mfa";
import { mfaDisableSchema } from "@/lib/validators";

/** Turning MFA off needs both factors, so a stolen session alone cannot do it. */
export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;
	const parsed = mfaDisableSchema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: "Enter your password and a code" }, { status: 400 });
	if (!verifyPassword(parsed.data.password, auth.user.passwordHash)) {
		return ApiResponse.json({ error: "Password is incorrect" }, { status: 400 });
	}
	if (!(await verifySecondFactor(env, auth.user, parsed.data.code))) {
		return ApiResponse.json({ error: "That code did not match" }, { status: 400 });
	}
	await disableMfa(env, auth.user.id);
	return ApiResponse.json({ ok: true });
}

export type POSTInput = z.input<typeof mfaDisableSchema>;
