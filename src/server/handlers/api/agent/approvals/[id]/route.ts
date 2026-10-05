import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getAgentSendRequest } from "@/lib/agent/approvals/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	try { return ApiResponse.json(await getAgentSendRequest(env, user, (await params).id)); }
	catch { return ApiResponse.json({ error: "Approval not found" }, { status: 404 }); }
}
