import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { formatUserDate } from "@/lib/time/utils";
import type { CreateWebhookInput, UpdateWebhookInput, WebhookDelivery, WebhookEvent } from "./types";

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; hint: string }[] = [
	{ value: "message.inbound", label: "Inbound message", hint: "A message was received and stored" },
	{ value: "message.outbound", label: "Outbound message", hint: "A message was sent" },
	{ value: "message.failed", label: "Delivery failure", hint: "An outbound message failed" },
];

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
	pending: "Pending",
	delivered: "Delivered",
	failed: "Failed",
	retrying: "Retrying",
	exhausted: "Gave up",
} as const;

export async function fetchWebhooks() {
	const json = await readApiJson(await apiRequest("/api/webhooks", { method: "GET" }));
	return json.webhooks ?? [];
}

export async function fetchDeliveries(webhookId: string) {
	const json = await readApiJson(
		await apiRequest("/api/webhooks/:id/deliveries", { method: "GET", param: { id: webhookId }, query: `limit=50` }),
	);
	return json.deliveries ?? [];
}

export async function createWebhook(input: CreateWebhookInput) {
	return readApiJson(
		await apiRequest("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, json: input }),
	);
}

export async function updateWebhook(id: string, input: UpdateWebhookInput) {
	return readApiJson(
		await apiRequest("/api/webhooks/:id", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: input, param: { id: id } }),
	);
}

export async function deleteWebhook(id: string) {
	return readApiJson(await apiRequest("/api/webhooks/:id", { method: "DELETE", param: { id: id } }));
}

export async function testWebhook(id: string) {
	return readApiJson(
		await apiRequest("/api/webhooks/:id/test", { method: "POST", param: { id: id } }),
	);
}

export async function retryDelivery(webhookId: string, deliveryId: string) {
	return readApiJson(
		await apiRequest("/api/webhooks/:id/deliveries/:deliveryId/retry", { method: "POST", param: { id: webhookId, deliveryId: deliveryId } }),
	);
}

/** Drizzle timestamps arrive as epoch seconds when they bypass the column mapper. */
export function formatTimestamp(value: string | number | null | undefined): string {
	if (value === null || value === undefined) return "—";
	const numeric = typeof value === "number" ? value : Date.parse(String(value));
	if (!Number.isFinite(numeric)) return "—";
	const ms = numeric < 1e12 ? numeric * 1000 : numeric;
	return formatUserDate(new Date(ms), { dateStyle: "medium", timeStyle: "short" });
}

export function formatDuration(ms: number | null): string {
	if (ms === null || ms === undefined) return "—";
	return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function isRetryable(delivery: WebhookDelivery): boolean {
	return delivery.status !== "delivered";
}
