import { apiRequest } from "@/lib/api/request";
import type { BulkMessageAction } from "@/server/handlers/api/messages/bulk/types";
import type { MessageCounts, MessageFolder } from "@/hooks/types";

export function getFolderNavCount(folder: MessageFolder, counts: MessageCounts["folders"]): number | undefined {
	return counts[folder].unread;
}

async function moveMessages(payload: { messageIds: string[]; action: BulkMessageAction; folderId?: string }) {
	const response = await apiRequest("/api/messages/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, json: payload });

	if (!response.ok) throw new Error("Unable to move messages");
	window.dispatchEvent(new Event("mailflare:messages-changed"));
}

export function moveMessagesToSystemFolder(messageIds: string[], action: "archive" | "spam" | "trash") {
	return moveMessages({ messageIds, action });
}

export function moveMessagesToCustomFolder(messageIds: string[], folderId: string) {
	return moveMessages({ messageIds, action: "folder", folderId });
}
