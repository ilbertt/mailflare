import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { clearMailboxesCache } from "@/components/mailbox-provider-utils";
import type { MailboxAliasesResponse, MailboxDetail, SharedInboxAccessResponse } from "./types";

export function getMailboxAddress(mailbox: Pick<MailboxDetail, "localPart" | "hostname">): string {
	return `${mailbox.localPart}@${mailbox.hostname}`;
}

export async function fetchMailbox(id: string): Promise<MailboxDetail> {
	const res = await apiRequest("/api/mailboxes/:id", { method: "GET", param: { id: id } });
	const json = await readApiJson(res);

	if (!res.ok || !json.mailbox) {
		throw new Error(json.error ?? "Failed to load mailbox");
	}

	return json.mailbox;
}

export async function updateMailboxSettings(
	id: string,
	input: { displayName: string; useAllDomains: boolean },
): Promise<MailboxDetail> {
	const res = await apiRequest("/api/mailboxes/:id", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: input, param: { id: id } });
	const json = await readApiJson(res);

	if (!res.ok || !json.mailbox) {
		throw new Error(json.error ?? "Failed to update mailbox");
	}

	clearMailboxesCache();
	return json.mailbox;
}

export async function fetchSharedInboxAccess(id: string): Promise<SharedInboxAccessResponse> {
	const res = await apiRequest("/api/mailboxes/:id/access", { method: "GET", param: { id: id } });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to load shared inbox access");
	return json;
}

export async function grantSharedInboxAccess(id: string, userId: string): Promise<void> {
	const res = await apiRequest("/api/mailboxes/:id/access", { method: "POST", headers: { "Content-Type": "application/json" }, json: { userId, permission: "full_access" }, param: { id: id } });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to add account");
}

export async function revokeSharedInboxAccess(id: string, userId: string): Promise<void> {
	const res = await apiRequest("/api/mailboxes/:id/access", { method: "DELETE", param: { id: id }, query: `userId=${encodeURIComponent(userId)}` });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to remove account");
}

export async function fetchMailboxAliases(id: string): Promise<MailboxAliasesResponse> {
	const res = await apiRequest("/api/mailboxes/:id/aliases", { method: "GET", param: { id: id } });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to load aliases");
	return json;
}

export async function createMailboxAlias(
	id: string,
	input: { domainId: string; localPart: string },
): Promise<void> {
	const res = await apiRequest("/api/mailboxes/:id/aliases", { method: "POST", headers: { "Content-Type": "application/json" }, json: input, param: { id: id } });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to add alias");

	clearMailboxesCache();
}

export async function deleteMailboxAlias(id: string, aliasId: string): Promise<void> {
	const res = await apiRequest("/api/mailboxes/:id/aliases", { method: "DELETE", param: { id: id }, query: `aliasId=${encodeURIComponent(aliasId)}` });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to remove alias");

	clearMailboxesCache();
}

export async function deleteMailbox(id: string): Promise<void> {
	const res = await apiRequest("/api/mailboxes/:id", { method: "DELETE", param: { id: id } });
	const json = await readApiJson(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to delete mailbox");

	clearMailboxesCache();
}
