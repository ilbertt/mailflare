import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { confirmAgentSend } from "@/lib/agent/approvals/utils";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	try { return ApiResponse.json(await confirmAgentSend(env, user, (await params).id, new URL(request.url).origin)); }
	catch (error) { return ApiResponse.json({ error: error instanceof Error ? error.message : "Send could not be confirmed" }, { status: 409 }); }
}
