import type { ApiRequest } from "@/shared/api-request";
import { and, eq, isNull, ne } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { calendarEvents, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { parseTimeZoneUpdate } from "./utils";
import { getRequestTimeZone } from "@/lib/time/utils";

export async function PATCH(request: ApiRequest<{ timeZone: string | null }>) {
	const env = getEnv();
	const user = await getCurrentUser(env, request);
	if (!user) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const input = await parseTimeZoneUpdate(request);
	if (!input) return ApiResponse.json({ error: "Choose a valid timezone" }, { status: 400 });
	const db = getDb(env);
	// Legacy series have no recorded timezone. Freeze their current recurrence
	// before changing the account preference, so future instants do not move.
	await db.update(calendarEvents).set({ timeZone: getRequestTimeZone(request, user.timeZone) }).where(and(
		eq(calendarEvents.userId, user.id),
		isNull(calendarEvents.timeZone),
		ne(calendarEvents.repeat, "none"),
	));
	await db.update(users).set({ timeZone: input.timeZone }).where(eq(users.id, user.id));
	return ApiResponse.json({ timeZone: input.timeZone });
}
