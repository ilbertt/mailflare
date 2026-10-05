import type { parseUpdateShortcutsSettingsRequestInput } from "./utils";
import type { ApiRequest } from "@/shared/api-request";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { ZodError } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireSessionUser } from "@/lib/api/auth";
import { getEnv } from "@/lib/cloudflare";
import type { UpdateShortcutsSettingsInput } from "./types";
import { parseUpdateShortcutsSettingsRequest } from "./utils";

export async function GET(request: Request) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;

	return ApiResponse.json({ enabled: auth.user.keyboardShortcutsEnabled });
}

export async function PATCH(request: ApiRequest<PATCHInput>) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;

	let input: UpdateShortcutsSettingsInput;
	try {
		input = await parseUpdateShortcutsSettingsRequest(request);
	} catch (error) {
		if (error instanceof ZodError) {
			return ApiResponse.json({ error: error.flatten() }, { status: 400 });
		}
		return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	await getDb(env)
		.update(users)
		.set({ keyboardShortcutsEnabled: input.enabled })
		.where(eq(users.id, auth.user.id));

	return ApiResponse.json({ enabled: input.enabled });
}

export type PATCHInput = parseUpdateShortcutsSettingsRequestInput;
