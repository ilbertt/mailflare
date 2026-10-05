import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { authenticateAdminApiKey, canManageAdminAccounts } from "@/lib/api/admin-auth";
import { isPrimaryAdmin } from "@/lib/auth/admin";
import { updateManagedAccountSchema } from "@/lib/validators";
import { getLicenseEntitlements } from "@/lib/licenses/service";
import { selectAccountById, updateAccountCredentials } from "@/server/handlers/api/accounts/[id]/utils";
import { deleteUserSessions } from "@/lib/auth/session";
import type { AdminAccountRouteParams } from "./types";

export async function GET(request: Request, { params }: AdminAccountRouteParams) {
	const env = getEnv();
	const auth = await authenticateAdminApiKey(env, request, "accounts");
	if (!auth) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!(await canManageAdminAccounts(env))) return ApiResponse.json({ error: "A Team license is required to manage accounts" }, { status: 403 });
	const { id } = await params;
	const account = await selectAccountById(getDb(env), id);
	if (!account || (account.id !== auth.userId && account.createdByUserId !== auth.userId)) return ApiResponse.json({ error: "Account not found" }, { status: 404 });
	return ApiResponse.json({ account: {
		id: account.id, email: account.email, name: account.name, role: account.role,
		disabled: account.disabled, canManageMailboxes: account.canManageMailboxes,
		forwardingEmail: account.forwardingEmail, hasAvatar: !!account.avatarKey,
	} });
}

export async function PATCH(request: ApiRequest<PATCHInput>, { params }: AdminAccountRouteParams) {
	const env = getEnv();
	const auth = await authenticateAdminApiKey(env, request, "accounts");
	if (!auth) return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!(await canManageAdminAccounts(env))) return ApiResponse.json({ error: "A Team license is required to manage accounts" }, { status: 403 });
	const { id } = await params;
	const db = getDb(env);
	const account = await selectAccountById(db, id);
	if (!account || (account.id !== auth.userId && account.createdByUserId !== auth.userId)) return ApiResponse.json({ error: "Account not found" }, { status: 404 });
	const parsed = updateManagedAccountSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	if (!isPrimaryAdmin(auth.user) && (account.isPrimaryAdmin || account.role === "admin" || parsed.data.role !== account.role)) {
		return ApiResponse.json({ error: "Only the primary admin can manage admin accounts" }, { status: 403 });
	}
	const canForwardEmail = (await getLicenseEntitlements(env)).canForwardEmail;
	if (!canForwardEmail && parsed.data.forwardingEmail && parsed.data.forwardingEmail !== account.forwardingEmail) return ApiResponse.json({ error: "A Pro or Team license is required for email forwarding" }, { status: 403 });
	await updateAccountCredentials(db, id, { name: parsed.data.name, password: parsed.data.password ?? null });
	if (parsed.data.password) await deleteUserSessions(env, id);
	await db.update(users).set({
		role: account.isPrimaryAdmin ? "admin" : parsed.data.role,
		disabled: account.isPrimaryAdmin ? false : parsed.data.disabled,
		canManageMailboxes: parsed.data.canManageMailboxes,
		...(isPrimaryAdmin(auth.user) && parsed.data.canManageDomains !== undefined ? { canManageDomains: parsed.data.canManageDomains } : {}),
		...(isPrimaryAdmin(auth.user) && parsed.data.canManageUsers !== undefined ? { canManageUsers: parsed.data.canManageUsers } : {}),
		...(parsed.data.forwardingEmail !== undefined ? { forwardingEmail: parsed.data.forwardingEmail } : {}),
	}).where(eq(users.id, id));
	return ApiResponse.json({ ok: true });
}

export type PATCHInput = z.input<typeof updateManagedAccountSchema>;
