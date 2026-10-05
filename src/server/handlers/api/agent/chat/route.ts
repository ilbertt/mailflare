import { ApiResponse } from "@/server/http/response";
import type { ApiRequest } from "@/shared/api-request";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth/cookies";
import { createAgentChatStream } from "@/lib/agent/chat";
import { allowAgentRequest } from "@/lib/agent/rate-limit";
import { readJsonBody } from "@/lib/http/request";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { agentProviderErrorMessage } from "@/lib/agent/errors";
import { getRequestTimeZone } from "@/lib/time/utils";

const schema = z.object({ mailboxId: z.string().min(1), conversationId: z.string().nullish(), text: z.string().trim().min(1).max(4_000), timeZone: z.string().max(80).optional() });

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	if (!await allowAgentRequest(env, `chat:${user.id}`)) return ApiResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
	const raw = await readJsonBody(request, 8_000).catch(() => null);
	const parsed = schema.safeParse(raw);
	if (!parsed.success) return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	try {
		const { conversationId, stream } = await createAgentChatStream({ env, user, mailboxId: parsed.data.mailboxId, origin: "chat" }, parsed.data.text, parsed.data.conversationId ?? undefined, request.signal, getRequestTimeZone(request, user.timeZone));
		return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Conversation-Id": conversationId } });
	} catch (error) {
		return ApiResponse.json({ error: agentProviderErrorMessage(error) }, { status: 400 });
	}
}

export type POSTInput = z.input<typeof schema>;
