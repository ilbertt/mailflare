import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { Message } from "@/hooks/types";
import type { CachedMessageDetail } from "./detail-cache-types";

const detailCache = new Map<string, CachedMessageDetail>();
const detailRequests = new Map<string, Promise<CachedMessageDetail>>();

export function clearMessageDetailCache() {
	detailCache.clear();
	detailRequests.clear();
}

export function getCachedMessageDetail(messageId: string): CachedMessageDetail | undefined {
	return detailCache.get(messageId);
}

export function setCachedMessageRead(messageId: string, read: boolean): void {
	const cached = detailCache.get(messageId);
	if (cached?.message) detailCache.set(messageId, { ...cached, message: { ...cached.message, read } });
}

export function primeMessageDetail(message: Message): void {
	if (message.textBody === undefined && message.htmlBody === undefined) return;
	detailCache.set(message.id, {
		message,
		body: { textBody: message.textBody ?? null, htmlBody: message.htmlBody ?? null },
	});
}

export async function fetchCachedMessageDetail(messageId: string, force = false): Promise<CachedMessageDetail> {
	if (!force && detailCache.has(messageId)) return detailCache.get(messageId) ?? {};
	if (!force && detailRequests.has(messageId)) return detailRequests.get(messageId) ?? {};
	const request = apiRequest("/api/messages/:messageId", { method: "GET", param: { messageId: messageId } })
		.then((response) => readApiJson(response))
		.then((data) => {
			detailCache.set(messageId, data);
			return data;
		})
		.finally(() => detailRequests.delete(messageId));
	detailRequests.set(messageId, request);
	return request;
}
