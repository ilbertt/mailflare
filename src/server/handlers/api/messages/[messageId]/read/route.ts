import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { markMessageAsReadForUser } from "@/lib/user";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ messageId: string }> },
) {
	const { messageId } = await params;
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) {
		return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const success = await markMessageAsReadForUser(env, user, messageId);
	if (!success) {
		return ApiResponse.json({ error: "Message not found" }, { status: 404 });
	}

	return ApiResponse.json({ success: true });
}
