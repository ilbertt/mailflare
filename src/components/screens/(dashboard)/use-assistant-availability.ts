import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { useEffect, useLayoutEffect, useState } from "react";
import { AUTH_SESSION_CHANGED_EVENT } from "@/lib/auth/client";
import { readInitialAssistantAvailability, saveAssistantAvailability } from "@/lib/agent/availability-client";

export function useAssistantAvailability() {
	const [enabled, setEnabled] = useState<boolean | null>(null);
	useLayoutEffect(() => setEnabled(readInitialAssistantAvailability()), []);

	useEffect(() => {
		let active = true;
		const refresh = async () => {
			try {
				const response = await apiRequest("/api/agent/availability", { method: "GET", redirectOnUnauthorized: false });
				if (!response.ok) return;
				const data = await readApiResult(response);
				if (active) {
					setEnabled(data.enabled);
					saveAssistantAvailability(data.enabled);
				}
			} catch { /* Availability can be refreshed when the window regains focus. */ }
		};
		const onFocus = () => { void refresh(); };
		const onVisibilityChange = () => { if (!document.hidden) void refresh(); };
		void refresh();
		window.addEventListener("focus", onFocus);
		window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onFocus);
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			active = false;
			window.removeEventListener("focus", onFocus);
			window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onFocus);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	return enabled;
}
