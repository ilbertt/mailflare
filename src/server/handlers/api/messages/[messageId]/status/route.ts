import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { updateMessageStatusForUser } from "@/lib/user";
import type { MessageStatusPayload } from "./types";
import { isAllowedMessageStatus } from "./utils";

export async function POST(
	request: ApiRequest<POSTInput>,
	{ params }: { params: Promise<{ messageId: string }> },
) {
	const { messageId } = await params;
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) {
		return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const payload = (await request.json()) as MessageStatusPayload;
	if (!isAllowedMessageStatus(payload.status)) {
		return ApiResponse.json({ error: "Invalid message status" }, { status: 400 });
	}

	const success = await updateMessageStatusForUser(env, user, messageId, payload.status);
	if (!success) {
		return ApiResponse.json({ error: "Message not found" }, { status: 404 });
	}

	return ApiResponse.json({ success: true });
}

export type POSTInput = MessageStatusPayload;
