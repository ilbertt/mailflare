export type WebhookEvent = "message.inbound" | "message.outbound" | "message.failed";

export type WebhookDeliveryStats = {
	total: number;
	delivered: number;
	failing: number;
	pending: number;
	lastAttemptAt: number | null;
};

export type Webhook = Awaited<ReturnType<typeof import("./utils").fetchWebhooks>>[number];
export type WebhookDelivery = Awaited<ReturnType<typeof import("./utils").fetchDeliveries>>[number];

export type CreateWebhookInput = {
	url: string;
	description?: string;
	events: WebhookEvent[];
	maxAttempts: number;
};

export type UpdateWebhookInput = {
	url?: string;
	description?: string | null;
	events?: WebhookEvent[];
	enabled?: boolean;
	maxAttempts?: number;
	rotateSecret?: true;
};
