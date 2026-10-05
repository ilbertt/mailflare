import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { appendOptimizedAvatar, MAX_SOURCE_AVATAR_SIZE } from "@/lib/avatar-upload-client";

export const CONTACT_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function validateContactAvatar(file: File): string | null {
	if (!CONTACT_AVATAR_ACCEPT.split(",").includes(file.type)) {
		return "Use a JPEG, PNG, WebP, or GIF image";
	}
	if (file.size > MAX_SOURCE_AVATAR_SIZE) return "Image must be 10 MB or smaller";
	return null;
}

export async function uploadContactAvatar(mailboxId: string, address: string, file: File): Promise<void> {
	const body = new FormData();
	body.append("mailboxId", mailboxId);
	body.append("address", address);
	await appendOptimizedAvatar(body, file);
	const response = await apiRequest("/api/contacts/avatar", { method: "POST", body });
	if (response.ok) return;
	const data = await readApiResult(response).catch(() => null);
	throw new Error(data?.error ?? "Upload failed");
}

export async function removeContactAvatar(mailboxId: string, address: string): Promise<void> {
	const params = new URLSearchParams({ mailboxId, address });
	const response = await apiRequest("/api/contacts/avatar", { method: "DELETE", query: `${params.toString()}` });
	if (response.ok) return;
	const data = await readApiResult(response).catch(() => null);
	throw new Error(data?.error ?? "Unable to remove profile picture");
}
