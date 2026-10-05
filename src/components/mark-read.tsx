import { apiRequest } from "@/lib/api/request";
import { useEffect } from "react";

import { markMessagesReadInCaches } from "@/hooks/utils";

export function MarkAsRead({ messageId }: { messageId: string }) {
	useEffect(() => {
		apiRequest("/api/messages/:messageId/read", { method: "POST", param: { messageId: messageId } })
			.then((response) => {
				if (!response.ok) return;
				markMessagesReadInCaches([messageId], true);
				window.dispatchEvent(new Event("mailflare:messages-changed"));
			})
			.catch(() => {
				// silently fail
			});
	}, [messageId]);

	return null;
}
