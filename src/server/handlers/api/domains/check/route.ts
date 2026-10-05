import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { preflightDomain } from "@/lib/domains/preflight";
import { setupDomainSchema } from "@/lib/validators";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	await requireUser(env, request);
	const parsed = setupDomainSchema.safeParse(await request.json());
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	try {
		return ApiResponse.json({ domain: await preflightDomain(env, parsed.data.hostname) });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Domain check failed";
		return ApiResponse.json({ error: message }, { status: 502 });
	}
}

export type POSTInput = z.input<typeof setupDomainSchema>;
