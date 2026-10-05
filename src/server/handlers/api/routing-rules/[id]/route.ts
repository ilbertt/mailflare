import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { folders, routingRules } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { getMailboxAccessLevel } from "@/lib/mailboxes/access";
import { routingRuleSchema } from "@/lib/validators";
import type { RoutingRuleRouteParams } from "./types";

export async function PATCH(request: ApiRequest<PATCHInput>, { params }: RoutingRuleRouteParams) {
	const { id } = await params;
	const env = getEnv();
	const user = await requireUser(env, request);
	const parsed = routingRuleSchema.safeParse(await request.json());
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const db = getDb(env);
	const [rule] = await db.select().from(routingRules).where(eq(routingRules.id, id)).limit(1);
	if (!rule?.mailboxId || rule.mailboxId !== parsed.data.mailboxId) {
		return ApiResponse.json({ error: "Rule not found" }, { status: 404 });
	}
	const access = await getMailboxAccessLevel(db, user, rule.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Rule not found" }, { status: 404 });
	}

	const destination = parsed.data.destination ?? (parsed.data.folderId ? `folder:${parsed.data.folderId}` : "");
	const systemAction = destination === "spam" || destination === "trash" ? destination : null;
	const folderId = destination.startsWith("folder:") ? destination.slice("folder:".length) : null;
	if (!systemAction && !folderId) {
		return ApiResponse.json({ error: "Destination is required" }, { status: 400 });
	}
	if (folderId) {
		const [folder] = await db
			.select()
			.from(folders)
			.where(and(eq(folders.id, folderId), eq(folders.mailboxId, rule.mailboxId)))
			.limit(1);
		if (!folder) {
			return ApiResponse.json({ error: "Folder not found" }, { status: 404 });
		}
	}

	await db
		.update(routingRules)
		.set({
			pattern: parsed.data.matchValue.trim(),
			matchField: parsed.data.matchField,
			matchOperator: parsed.data.matchOperator,
			matchValue: parsed.data.matchValue.trim(),
			action: systemAction ?? "store",
			folderId,
			forwardTo: null,
			priority: parsed.data.priority,
		})
		.where(eq(routingRules.id, id));

	return ApiResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RoutingRuleRouteParams) {
	const { id } = await params;
	const env = getEnv();
	const user = await requireUser(env, request);
	const db = getDb(env);
	const [rule] = await db.select().from(routingRules).where(eq(routingRules.id, id)).limit(1);
	if (!rule?.mailboxId) {
		return ApiResponse.json({ error: "Rule not found" }, { status: 404 });
	}
	const access = await getMailboxAccessLevel(db, user, rule.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Rule not found" }, { status: 404 });
	}

	await db.delete(routingRules).where(eq(routingRules.id, id));

	return ApiResponse.json({ ok: true });
}

export type PATCHInput = z.input<typeof routingRuleSchema>;
