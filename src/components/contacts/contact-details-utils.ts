import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { getEmailAddress } from "@/lib/email/address";
import type { ContactDetailsRecord } from "./contact-details-types";

export async function fetchContactDetails(
	mailboxId: string,
	address: string,
): Promise<ContactDetailsRecord> {
	const params = new URLSearchParams({ mailboxId, address: getEmailAddress(address) });
	const response = await apiRequest("/api/contacts", { method: "GET", query: `${params.toString()}` });
	const data = await readApiResult(response);
	if (!response.ok || !data.contact) throw new Error(data.error ?? "Unable to load contact");
	return data.contact;
}

export async function updateContactName(
	mailboxId: string,
	address: string,
	displayName: string,
): Promise<ContactDetailsRecord> {
	const response = await apiRequest("/api/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: { mailboxId, address: getEmailAddress(address), displayName } });
	const data = await readApiResult(response);
	if (!response.ok || !data.contact) throw new Error(data.error ?? "Unable to update contact");
	return data.contact;
}

export function getContactInitial(name: string, address: string): string {
	return (name.trim() || getEmailAddress(address)).slice(0, 1).toUpperCase();
}
