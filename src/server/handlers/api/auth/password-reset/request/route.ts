import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { passwordResetRequestSchema } from "@/lib/validators";
import { allowLoginAttempt } from "@/lib/auth/rate-limit";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import { readJsonBody } from "@/lib/http/request";
import { RequestBodyTooLargeError } from "@/lib/http/errors";
import { requestPasswordReset } from "@/lib/auth/password-reset";

/**
 * Always answers 200 once the input is well-formed, whether or not the
 * account exists or has a recovery address, so the form reveals nothing.
 */
export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	let body: unknown;
	try {
		body = await readJsonBody(request, 16 * 1024);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: "Invalid request" }, { status });
	}
	const parsed = passwordResetRequestSchema.safeParse(body);
	if (!parsed.success) {
		return ApiResponse.json({ error: "Enter the email address you sign in with" }, { status: 400 });
	}
	if (!(await allowLoginAttempt(env, request))) {
		return ApiResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429, headers: { "Retry-After": "60" } });
	}
	if (!(await verifyTurnstileToken(env, request, (body as Record<string, unknown>).turnstileToken))) {
		return ApiResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
	}

	const origin = env.APP_URL?.trim() || new URL(request.url).origin;
	try {
		await requestPasswordReset(env, parsed.data.email, origin);
	} catch (error) {
		// Delivery problems are logged, never surfaced: the answer stays uniform.
		console.error("Password reset request failed", error);
	}
	return ApiResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export type POSTInput = z.input<typeof passwordResetRequestSchema> & { turnstileToken?: string };
