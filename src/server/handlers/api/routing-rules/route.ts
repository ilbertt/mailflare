import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { and, eq } from "drizzle-orm";
import { getEnv } from "@/lib/cloudflare";
import { getDb } from "@/db";
import { folders, routingRules } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { newId } from "@/lib/ids";
import { getMailboxAccessLevel } from "@/lib/mailboxes/access";
import { routingRuleSchema } from "@/lib/validators";

export async function GET(request: Request) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const url = new URL(request.url);
	const mailboxId = url.searchParams.get("mailboxId");
	if (!mailboxId) {
		return ApiResponse.json({ rules: [] });
	}

	const db = getDb(env);
	const access = await getMailboxAccessLevel(db, user, mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}

	const rows = await db
		.select()
		.from(routingRules)
		.where(and(eq(routingRules.mailboxId, mailboxId), eq(routingRules.scope, "mailbox")));
	return ApiResponse.json({ rules: rows });
}

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const parsed = routingRuleSchema.safeParse(await request.json());
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const db = getDb(env);
	const access = await getMailboxAccessLevel(db, user, parsed.data.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}
	const mailbox = access.mailbox;

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
			.where(and(eq(folders.id, folderId), eq(folders.mailboxId, mailbox.id)))
			.limit(1);
		if (!folder) {
			return ApiResponse.json({ error: "Folder not found" }, { status: 404 });
		}
	}

	const id = newId("rule");
	await db.insert(routingRules).values({
		id,
		userId: user.id,
		domainId: mailbox.domainId,
		scope: "mailbox",
		pattern: parsed.data.matchValue.trim(),
		matchField: parsed.data.matchField,
		matchOperator: parsed.data.matchOperator,
		matchValue: parsed.data.matchValue.trim(),
		action: systemAction ?? "store",
		mailboxId: mailbox.id,
		folderId,
		forwardTo: null,
		priority: parsed.data.priority,
	});

	return ApiResponse.json({ id, ...parsed.data });
}

export type POSTInput = z.input<typeof routingRuleSchema>;
