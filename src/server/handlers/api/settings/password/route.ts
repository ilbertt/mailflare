import type { parseChangePasswordRequestInput } from "./utils";
import type { ApiRequest } from "@/shared/api-request";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { ZodError } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { deleteUserSessions, getSessionTokenFromRequestHeaders } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getEnv } from "@/lib/cloudflare";
import type { ChangePasswordInput } from "./types";
import { parseChangePasswordRequest } from "./utils";

export async function PATCH(request: ApiRequest<PATCHInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	let parsed: ChangePasswordInput;

	try {
		parsed = await parseChangePasswordRequest(request);
	} catch (err) {
		if (err instanceof ZodError) {
			return ApiResponse.json({ error: err.flatten() }, { status: 400 });
		}
		return ApiResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	if (!verifyPassword(parsed.currentPassword, user.passwordHash)) {
		return ApiResponse.json({ error: "Current password is incorrect" }, { status: 400 });
	}

	if (verifyPassword(parsed.newPassword, user.passwordHash)) {
		return ApiResponse.json({ error: "New password must be different from the current password" }, { status: 400 });
	}

	const db = getDb(env);
	await db
		.update(users)
		.set({ passwordHash: hashPassword(parsed.newPassword) })
		.where(eq(users.id, user.id));
	// Anyone else holding a session for this account is signed out; this one stays.
	await deleteUserSessions(env, user.id, getSessionTokenFromRequestHeaders(request));

	return ApiResponse.json({ ok: true });
}

export type PATCHInput = parseChangePasswordRequestInput;
