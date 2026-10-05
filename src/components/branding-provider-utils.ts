import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import type { Branding } from "@/lib/branding/types";

export const DEFAULT_BRANDING: Branding = {
	appName: "Mailflare",
	hasCustomIcon: false,
	canCustomizeBranding: false,
};

export async function fetchBranding(): Promise<Branding> {
	const response = await apiRequest("/api/branding", { method: "GET", cache: "no-store", authenticated: false });
	if (!response.ok) return DEFAULT_BRANDING;
	return await readApiResult(response);
}
