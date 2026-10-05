import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { appendOptimizedAvatar, MAX_SOURCE_AVATAR_SIZE } from "@/lib/avatar-upload-client";
import { clearMailboxesCache } from "@/components/mailbox-provider-utils";

export const PROFILE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function validateProfileAvatar(file: File): string | null {
	if (!PROFILE_AVATAR_ACCEPT.split(",").includes(file.type)) {
		return "Use a JPEG, PNG, WebP, or GIF image";
	}
	if (file.size > MAX_SOURCE_AVATAR_SIZE) {
		return "Image must be 10 MB or smaller";
	}
	return null;
}

export async function uploadProfileAvatar(file: File): Promise<void> {
	const body = new FormData();
	await appendOptimizedAvatar(body, file);
	const response = await apiRequest("/api/profile/avatar", { method: "POST", body });
	if (response.ok) return;

	const data = await readApiResult(response).catch(() => null);
	throw new Error(data?.error ?? "Upload failed");
}

export function getMailboxProfileAvatarUrl(mailboxId: string): string {
	return `/api/mailboxes/${mailboxId}/avatar?v=${Date.now()}`;
}

export async function uploadMailboxProfileAvatar(mailboxId: string, file: File): Promise<void> {
	const body = new FormData();
	await appendOptimizedAvatar(body, file);
	const response = await apiRequest("/api/mailboxes/:id/avatar", { method: "POST", body, param: { id: mailboxId } });
	if (response.ok) {
		clearMailboxesCache();
		return;
	}

	const data = await readApiResult(response).catch(() => null);
	throw new Error(data?.error ?? "Upload failed");
}
