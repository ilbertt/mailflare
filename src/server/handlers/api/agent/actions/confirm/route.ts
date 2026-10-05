import { ApiResponse } from "@/server/http/response";
import type { ApiRequest } from "@/shared/api-request";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { confirmAgentAction } from "@/lib/agent/actions";

const schema = z.object({ toolMessageId: z.string().min(1) });

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const parsed = schema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	try { return ApiResponse.json(await confirmAgentAction(env, user, parsed.data.toolMessageId)); }
	catch (error) { return ApiResponse.json({ error: error instanceof Error ? error.message : "Could not approve action" }, { status: 409 }); }
}

export type POSTInput = z.input<typeof schema>;
