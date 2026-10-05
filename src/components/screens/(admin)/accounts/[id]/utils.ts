import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { appendOptimizedAvatar } from "@/lib/avatar-upload-client";
import type { AccountDetail, AccountMailboxAccessItem, AccountMailboxItem, DomainOption, ManagedAccount, ManagedDomain, ManagedMailbox } from "./types";

export const permissionLabels: Record<NonNullable<AccountMailboxAccessItem["permission"]>, string> = {
	read_only: "Read Only",
	send_as: "Send As",
	send_on_behalf: "Send on Behalf",
	full_access: "Full Access",
};

export async function fetchAccount(accountId: string): Promise<AccountDetail> {
	const res = await apiRequest("/api/accounts/:id", { method: "GET", param: { id: accountId } });
	const json = await readApiResult(res);
	if (!res.ok || !json.account) throw new Error(json.error ?? "Failed to load account");
	return json.account;
}

export async function fetchDomains(): Promise<DomainOption[]> {
	const res = await apiRequest("/api/domains", { method: "GET" });
	const json = await readApiResult(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to load domains");
	return json.domains ?? [];
}

export async function fetchAccountMailboxes(accountId: string): Promise<AccountMailboxItem[]> {
	const res = await apiRequest("/api/accounts/:id/mailboxes", { method: "GET", param: { id: accountId } });
	const json = await readApiResult(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to load account mailboxes");
	return json.mailboxes ?? [];
}

export async function revokeAccountMailboxAccess(accountId: string, mailboxId: string): Promise<void> {
	const res = await apiRequest("/api/accounts/:id/mailbox-access", { method: "DELETE", param: { id: accountId }, query: `mailboxId=${encodeURIComponent(mailboxId)}` });
	const json = await readApiResult(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to remove access");
}

export function getMailboxAddress(mailbox: Pick<AccountMailboxAccessItem, "localPart" | "hostname">): string {
	return `${mailbox.localPart}@${mailbox.hostname}`;
}

export function getMailboxLabel(mailbox: Pick<AccountMailboxAccessItem, "displayName" | "localPart">): string {
	return mailbox.displayName?.trim() || mailbox.localPart;
}

export async function fetchManagedAccount(accountId: string): Promise<ManagedAccount> {
	const response = await apiRequest("/api/accounts/:id", { method: "GET", param: { id: accountId } });
	const data = await readApiResult(response);
	if (!response.ok || !data.account) throw new Error(data.error ?? "Unable to load account");
	return data.account;
}

export async function saveManagedAccount(account: ManagedAccount): Promise<void> {
	const response = await apiRequest("/api/accounts/:id", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: {
			name: account.name,
			role: account.role,
			disabled: account.disabled,
			canManageMailboxes: account.canManageMailboxes,
			canManageDomains: account.canManageDomains,
			canManageUsers: account.canManageUsers,
			forwardingEmail: account.forwardingEmail,
			password: account.newPassword || undefined,
		}, param: { id: account.id } });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to update account");
}

export type TransferCandidate = {
	id: string;
	email: string;
	name: string;
	hasAvatar: boolean;
	disabled: boolean;
};

export async function fetchTransferCandidates(): Promise<TransferCandidate[]> {
	const response = await apiRequest("/api/accounts", { method: "GET" });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to load accounts");
	return (data.accounts ?? []).map((account) => ({
		id: account.id,
		email: account.email,
		name: account.name,
		hasAvatar: !!account.hasAvatar,
		disabled: !!account.disabled,
	}));
}

export async function transferPrimaryAdmin(accountId: string): Promise<void> {
	const response = await apiRequest("/api/accounts/:id/transfer-primary", { method: "POST", param: { id: accountId } });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to transfer the primary admin role");
}

export async function uploadManagedAccountAvatar(accountId: string, file: File): Promise<void> {
	const form = new FormData();
	await appendOptimizedAvatar(form, file);
	const response = await apiRequest("/api/accounts/:id/avatar", { method: "POST", body: form, param: { id: accountId } });
	if (!response.ok) throw new Error("Unable to update avatar");
}

export function getManagedAccountAvatarUrl(accountId: string, version: number): string {
	return `/api/accounts/${accountId}/avatar${version ? `?v=${version}` : ""}`;
}

export async function fetchManagedMailboxes(accountId: string): Promise<ManagedMailbox[]> {
	const response = await apiRequest("/api/accounts/:id/mailboxes", { method: "GET", param: { id: accountId } });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to load mailboxes");
	return data.mailboxes ?? [];
}

export async function fetchManagedDomains(): Promise<ManagedDomain[]> {
	const response = await apiRequest("/api/domains", { method: "GET" });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to load domains");
	return data.domains ?? [];
}

export async function addManagedMailbox(
	account: ManagedAccount,
	input: { domainId: string; localPart: string },
): Promise<void> {
	const response = await apiRequest("/api/mailboxes", { method: "POST", headers: { "Content-Type": "application/json" }, json: {
			ownerUserId: account.id,
			domainId: input.domainId,
			localPart: input.localPart,
			displayName: account.name,
			type: "personal",
		} });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to add mailbox");
}

export async function removeManagedMailbox(mailboxId: string): Promise<void> {
	const response = await apiRequest("/api/mailboxes/:id", { method: "DELETE", param: { id: mailboxId } });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to remove mailbox");
}
