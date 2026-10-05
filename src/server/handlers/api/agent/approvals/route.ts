import { ApiResponse } from "@/server/http/response";
import type { ApiRequest } from "@/shared/api-request";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { requestAgentSend } from "@/lib/agent/approvals/utils";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";

const schema = z.object({ draftId: z.string().min(1), expectedRevision: z.number().int().positive() });

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const parsed = schema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	try { return ApiResponse.json(await requestAgentSend(env, user, parsed.data.draftId, parsed.data.expectedRevision)); }
	catch (error) { return ApiResponse.json({ error: error instanceof Error ? error.message : "Could not create approval" }, { status: 409 }); }
}

export type POSTInput = z.input<typeof schema>;
