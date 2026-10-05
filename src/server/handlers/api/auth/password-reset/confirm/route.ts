import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { passwordResetConfirmSchema } from "@/lib/validators";
import { allowLoginAttempt } from "@/lib/auth/rate-limit";
import { readJsonBody } from "@/lib/http/request";
import { RequestBodyTooLargeError } from "@/lib/http/errors";
import { completePasswordReset } from "@/lib/auth/password-reset";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	let body: unknown;
	try {
		body = await readJsonBody(request, 16 * 1024);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: "Invalid request" }, { status });
	}
	const parsed = passwordResetConfirmSchema.safeParse(body);
	if (!parsed.success) {
		return ApiResponse.json({ error: "Choose a password of at least 8 characters" }, { status: 400 });
	}
	if (!(await allowLoginAttempt(env, request))) {
		return ApiResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429, headers: { "Retry-After": "60" } });
	}

	const result = await completePasswordReset(env, parsed.data.token, parsed.data.password, request);
	if (!result.ok) return ApiResponse.json({ error: result.error }, { status: 400 });
	return ApiResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export type POSTInput = z.input<typeof passwordResetConfirmSchema>;
