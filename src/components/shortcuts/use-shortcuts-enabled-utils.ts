import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

export async function loadShortcutsEnabled(): Promise<boolean> {
	const response = await apiRequest("/api/settings/shortcuts", { method: "GET" });
	const data = await readApiResult(response);
	if (!response.ok || typeof data.enabled !== "boolean") {
		throw new Error(typeof data.error === "string" ? data.error : "Failed to load shortcut settings");
	}
	return data.enabled;
}

export async function updateShortcutsEnabled(enabled: boolean): Promise<boolean> {
	const response = await apiRequest("/api/settings/shortcuts", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: { enabled } });
	const data = await readApiResult(response);
	if (!response.ok || typeof data.enabled !== "boolean") {
		throw new Error(typeof data.error === "string" ? data.error : "Failed to update shortcut settings");
	}
	return data.enabled;
}
