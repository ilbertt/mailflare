import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getAgentEnabled } from "@/lib/agent/provider";

export async function GET(request: Request) {
	const env = getEnv();
	if (!await getCurrentUser(env, request)) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	return ApiResponse.json({ enabled: await getAgentEnabled(env) }, { headers: { "Cache-Control": "no-store" } });
}
