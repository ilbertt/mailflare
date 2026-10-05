import { ApiResponse } from "@/server/http/response";
import type { ApiRequest } from "@/shared/api-request";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { isPrimaryAdmin } from "@/lib/auth/admin";
import { listCloudflareAgentModels, listCompatibleAgentModels } from "@/lib/agent/provider-models";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";

const requestSchema = z.object({
	provider: z.enum(["cloudflare", "compatible"]),
	preset: z.enum(["openai", "openrouter", "groq", "custom"]),
	baseUrl: z.string().max(500),
	apiKey: z.string().max(2_000).optional(),
});

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const session = await requireSessionUser(env, request);
	if (session.error) return session.error;
	if (!isPrimaryAdmin(session.user)) return ApiResponse.json({ error: "Forbidden" }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const parsed = requestSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: "Invalid provider details" }, { status: 400 });
	try {
		const result = parsed.data.provider === "cloudflare" ? await listCloudflareAgentModels(env) : await listCompatibleAgentModels(env, parsed.data);
		return ApiResponse.json(result, { headers: { "Cache-Control": "no-store" } });
	} catch (error) {
		return ApiResponse.json({ error: error instanceof Error ? error.message : "Unable to load models" }, { status: 400 });
	}
}

export type POSTInput = z.input<typeof requestSchema>;
