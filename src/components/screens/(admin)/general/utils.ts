import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { GeneralSettings } from "./types";

export async function loadGeneralSettings(): Promise<GeneralSettings> {
	const response = await apiRequest("/api/admin/general", { method: "GET", cache: "no-store" });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Could not load general settings");
	return data;
}

export async function saveGeneralSettings(outboundAttachmentMaxMb: number): Promise<GeneralSettings> {
	const response = await apiRequest("/api/admin/general", { method: "PUT", headers: { "Content-Type": "application/json" }, json: { outboundAttachmentMaxMb } });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Could not save general settings");
	return data;
}
