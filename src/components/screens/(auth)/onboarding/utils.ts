import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type {
	DomainCreateResult,
	DomainListResult,
	DomainPreflightResponse,
	MailboxCreateResult,
} from "./types";

export async function getDomains(): Promise<DomainListResult> {
	const res = await apiRequest("/api/domains", { method: "GET" });
	return await readApiResult(res);
}

export async function checkDomain(hostname: string): Promise<DomainPreflightResponse> {
	const res = await apiRequest("/api/domains/check", { method: "POST", headers: { "Content-Type": "application/json" }, json: { hostname } });
	const data = await readApiResult(res);
	return { ok: res.ok, ...data };
}

export async function createDomain(
	hostname: string,
	enableSending: boolean,
	replaceMxRecords = false,
): Promise<{ ok: boolean; data: DomainCreateResult }> {
	const res = await apiRequest("/api/domains", { method: "POST", headers: { "Content-Type": "application/json" }, json: { hostname, enableRouting: true, enableSending, replaceMxRecords } });

	return {
		ok: res.ok,
		data: await readApiResult(res),
	};
}

export async function createMailbox(
	domainId: string,
	localPart: string,
): Promise<{ ok: boolean; data: MailboxCreateResult }> {
	const res = await apiRequest("/api/mailboxes", { method: "POST", headers: { "Content-Type": "application/json" }, json: { domainId, localPart, displayName: localPart } });

	return {
		ok: res.ok,
		data: await readApiResult(res),
	};
}
