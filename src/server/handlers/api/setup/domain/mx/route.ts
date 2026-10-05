import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { hasAdminAccount } from "@/lib/auth/setup";
import { getEnv } from "@/lib/cloudflare";
import { preflightDomain } from "@/lib/domains/preflight";
import { hasConflictingMxRecords } from "@/lib/domains/mx-records";
import { setupDomainSchema } from "@/lib/validators";
import { readJsonBody } from "@/lib/http/request";
import { RequestBodyTooLargeError } from "@/lib/http/errors";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	if (await hasAdminAccount(env)) {
		return ApiResponse.json({ error: "Initial setup is already complete" }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await readJsonBody(request, 16 * 1024);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: "Invalid MX check request" }, { status });
	}

	const parsed = setupDomainSchema.safeParse(body);
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	try {
		const domain = await preflightDomain(env, parsed.data.hostname);
		const hasExistingMx = await hasConflictingMxRecords(
			env,
			domain.zone.id,
			domain.hostname,
		);
		return ApiResponse.json({ hasExistingMx });
	} catch (error) {
		const message = error instanceof Error ? error.message : "MX record check failed";
		return ApiResponse.json({ error: message }, { status: 502 });
	}
}

export type POSTInput = z.input<typeof setupDomainSchema>;
