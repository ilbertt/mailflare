import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { BrandingFormResponse } from "./types";

export const BRANDING_ICON_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export async function saveBranding(appName: string, icon: File | null): Promise<BrandingFormResponse> {
	const form = new FormData();
	form.set("appName", appName);
	if (icon) form.set("icon", icon, icon.name);
	const response = await apiRequest("/api/branding", { method: "PUT", body: form });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to save branding");
	return data;
}
