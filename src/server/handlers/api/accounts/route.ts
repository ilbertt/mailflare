import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { createUserAccountSchema } from "@/lib/validators";
import { canManageUsers, isPrimaryAdmin } from "@/lib/auth/admin";
import { createAccountResponse } from "./create";
import { accountListItemFromUser, listAccountsForAdmin, requireTeamAdmin } from "./utils";

export async function GET(request: Request) {
	const access = await requireTeamAdmin(request);
	if (access.error) return access.error;
	const rows = await listAccountsForAdmin(getDb(access.env));
	return ApiResponse.json({
		accounts: rows.map((row) => accountListItemFromUser(row)),
	});
}

export async function POST(request: ApiRequest<POSTInput>) {
	const access = await requireTeamAdmin(request);
	if (access.error) return access.error;
	const parsed = createUserAccountSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}
	const actor = access.user!;
	if (!canManageUsers(actor)) {
		return ApiResponse.json({ error: "You do not have permission to manage users" }, { status: 403 });
	}
	if (parsed.data.role === "admin" && !isPrimaryAdmin(actor)) {
		return ApiResponse.json({ error: "Only the primary admin can create admin accounts" }, { status: 403 });
	}
	return createAccountResponse(access.env, actor.id, parsed.data);
}

export type POSTInput = z.input<typeof createUserAccountSchema>;
