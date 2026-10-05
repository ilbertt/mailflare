import type { JsonResponse } from "@/server/http/response";
import type { users } from "@/db/schema";
import type { ApiAuthResult } from "@/lib/api/key-auth-types";

export type CalendarAuthorization =
	| { user: typeof users.$inferSelect; key: ApiAuthResult | null; error: null }
	| { user: null; key: null; error: JsonResponse<{ error: string }, 401 | 403> };
