import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { folders } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { newId } from "@/lib/ids";
import { folderSchema } from "@/lib/validators";
import { getMailboxFolderAccess, listFoldersForMailbox } from "./utils";

export async function GET(request: Request) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const url = new URL(request.url);
	const mailboxId = url.searchParams.get("mailboxId");
	if (!mailboxId) {
		return ApiResponse.json({ folders: [] });
	}

	const db = getDb(env);
	const access = await getMailboxFolderAccess(db, user, mailboxId);
	if (!access) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}

	const rows = await listFoldersForMailbox(db, mailboxId);
	return ApiResponse.json({ folders: rows });
}

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const parsed = folderSchema.safeParse(await request.json());
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const db = getDb(env);
	const access = await getMailboxFolderAccess(db, user, parsed.data.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}

	const name = parsed.data.name.trim();
	const [existing] = await db
		.select()
		.from(folders)
		.where(and(eq(folders.mailboxId, parsed.data.mailboxId), eq(folders.name, name)))
		.limit(1);
	if (existing) {
		return ApiResponse.json({ error: "Folder already exists" }, { status: 409 });
	}

	const id = newId("fld");
	await db.insert(folders).values({
		id,
		userId: access.mailboxUserId,
		mailboxId: parsed.data.mailboxId,
		name,
		color: parsed.data.color,
	});

	return ApiResponse.json({ id, mailboxId: parsed.data.mailboxId, name, color: parsed.data.color });
}

export type POSTInput = z.input<typeof folderSchema>;
