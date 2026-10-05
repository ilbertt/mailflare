import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { folders } from "@/db/schema";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { RequestBodyTooLargeError } from "@/lib/http/errors";
import { readJsonBody } from "@/lib/http/request";
import { getImportMessageUserId } from "@/lib/import/destination";
import { fetchImapMessages } from "@/lib/import/imap";
import { importMessagesToMailbox } from "@/lib/import/service";
import { getMailboxAccessLevel } from "@/lib/mailboxes/access";
import type { ImapImportRequest } from "./types";
import { parseImapImportRequest } from "./utils";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	let input: ReturnType<typeof parseImapImportRequest>;
	try {
		const body = await readJsonBody<ImapImportRequest>(request, 16 * 1024);
		input = parseImapImportRequest(body);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: error instanceof Error ? error.message : "Invalid IMAP import request" }, { status });
	}

	const access = await getMailboxAccessLevel(getDb(env), user, input.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}
	if (input.destination.type === "folder") {
		const db = getDb(env);
		const [folder] = await db
			.select({ id: folders.id })
			.from(folders)
			.where(and(eq(folders.id, input.destination.folderId), eq(folders.mailboxId, access.mailbox.id)))
			.limit(1);
		if (!folder) {
			return ApiResponse.json({ error: "Folder not found" }, { status: 404 });
		}
	}

	try {
		const rawMessages = await fetchImapMessages(input);
		const result = await importMessagesToMailbox(env, {
			userId: getImportMessageUserId(input.destination, user.id, access.mailbox.userId),
			mailboxId: access.mailbox.id,
			destination: input.destination,
			messages: rawMessages,
		});
		return ApiResponse.json(result);
	} catch (error) {
		return ApiResponse.json(
			{ error: error instanceof Error ? error.message : "IMAP import failed" },
			{ status: 502 },
		);
	}
}

export type POSTInput = ImapImportRequest;
