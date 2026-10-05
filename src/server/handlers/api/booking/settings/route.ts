import type { ApiRequest } from "@/shared/api-request";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/cookies";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { normalizeBookingUsername } from "@/lib/booking/utils";
import { getEnv } from "@/lib/cloudflare";
import type { BookingSettingsInput } from "./types";

export async function PATCH(request: ApiRequest<PATCHInput>) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (user.role !== "admin") return ApiResponse.json({ error: "Only administrators can change booking usernames." }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const body = await request.json().catch(() => null) as BookingSettingsInput | null;
	const username = normalizeBookingUsername(body?.username);
	if (!username) return ApiResponse.json({ error: "Use up to 64 lowercase letters, numbers, dots, underscores, plus signs, or hyphens." }, { status: 400 });
	const db = getDb(env);
	const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.bookingUsername, username)).limit(1);
	if (taken && taken.id !== user.id) return ApiResponse.json({ error: "This username is already taken." }, { status: 409 });
	try {
		await db.update(users).set({ bookingUsername: username }).where(eq(users.id, user.id));
		return ApiResponse.json({ username });
	} catch (error) {
		if (error instanceof Error && /UNIQUE constraint failed|users_booking_username_idx/i.test(error.message)) return ApiResponse.json({ error: "This username is already taken." }, { status: 409 });
		throw error;
	}
}

export type PATCHInput = BookingSettingsInput;
