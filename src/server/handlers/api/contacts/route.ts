import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { normalizeEmailAddress } from "@/lib/email/address";
import { getMailboxAccessLevel } from "@/lib/mailboxes/access";
import { getPersonalIdentityForAddress, syncPersonalIdentity } from "@/lib/profile/sync";
import type { ContactRequestInput } from "./types";
import { getContactByEmail, saveManualContactName, toContactDetails } from "./utils";

export async function GET(request: Request) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const url = new URL(request.url);
	const mailboxId = url.searchParams.get("mailboxId");
	const email = normalizeEmailAddress(url.searchParams.get("address") ?? "");
	if (!mailboxId || !email) {
		return ApiResponse.json({ error: "Mailbox and contact are required" }, { status: 400 });
	}

	const db = getDb(env);
	const access = await getMailboxAccessLevel(db, user, mailboxId);
	if (!access?.canRead) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}
	const storedContact = toContactDetails(await getContactByEmail(db, access.mailbox.userId, email));
	const account = await getPersonalIdentityForAddress(db, access.mailbox.userId, email);
	const contact = account
		? {
				...(storedContact ?? {}),
				email,
				displayName: account.name,
				hasAvatar: !!account.avatarKey,
				source: "manual" as const,
				blocked: storedContact?.blocked ?? false,
				lastSeenAt: storedContact?.lastSeenAt ?? null,
			}
		: storedContact;
	return ApiResponse.json({
		contact: contact ?? {
			email,
			displayName: null,
			hasAvatar: false,
			source: null,
			blocked: false,
			lastSeenAt: null,
		},
	});
}

export async function PATCH(request: ApiRequest<PATCHInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const body = (await request.json()) as ContactRequestInput;
	const email = normalizeEmailAddress(body.address ?? "");
	const displayName = body.displayName?.trim() ?? "";
	if (!body.mailboxId || !email || !displayName || displayName.length > 100) {
		return ApiResponse.json({ error: "A valid contact name is required" }, { status: 400 });
	}

	const db = getDb(env);
	const access = await getMailboxAccessLevel(db, user, body.mailboxId);
	if (!access?.canManage) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}
	const account = await getPersonalIdentityForAddress(db, access.mailbox.userId, email);
	if (account) {
		if (account.userId !== user.id) {
			return ApiResponse.json({ error: "Only the account owner can change this contact" }, { status: 403 });
		}
		await syncPersonalIdentity(db, {
			userId: account.userId,
			name: displayName,
			avatarKey: account.avatarKey,
		});
	}
	const contact = toContactDetails(await saveManualContactName(db, {
		userId: access.mailbox.userId,
		email,
		displayName,
	}));
	return ApiResponse.json({ contact });
}

export type PATCHInput = ContactRequestInput;
