import type { parseUpdateProfileRequestInput } from "./utils";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { getLicenseEntitlements } from "@/lib/licenses/service";
import { syncPersonalIdentity } from "@/lib/profile/sync";
import type { UpdateProfileInput } from "./types";
import { parseUpdateProfileRequest } from "./utils";

export async function PATCH(request: ApiRequest<PATCHInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	let parsed: UpdateProfileInput;
	try {
		parsed = await parseUpdateProfileRequest(request);
	} catch (err) {
		if (err instanceof ZodError) {
			return ApiResponse.json({ error: err.flatten() }, { status: 400 });
		}
		return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	const db = getDb(env);
	const canForwardEmail = (await getLicenseEntitlements(env)).canForwardEmail;
	if (!canForwardEmail && parsed.forwardingEmail && parsed.forwardingEmail !== user.forwardingEmail) {
		return ApiResponse.json({ error: "A Pro or Team license is required for email forwarding" }, { status: 403 });
	}
	const forwardingEmail = parsed.forwardingEmail === undefined ? user.forwardingEmail : parsed.forwardingEmail;
	await syncPersonalIdentity(db, {
		userId: user.id,
		name: parsed.name,
		avatarKey: user.avatarKey,
	});
	await db
		.update(users)
		.set({ resetEmail: parsed.resetEmail, forwardingEmail })
		.where(eq(users.id, user.id));

	return ApiResponse.json({
		user: {
			id: user.id,
			email: user.email,
			name: parsed.name,
			resetEmail: parsed.resetEmail,
			forwardingEmail,
			canForwardEmail,
		},
	});
}

export type PATCHInput = parseUpdateProfileRequestInput;
