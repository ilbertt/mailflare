import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

export async function loadLicenseIndicatorStatus() {
	try {
		const response = await apiRequest("/api/licenses", { method: "GET", redirectOnUnauthorized: false });
		if (!response.ok) return null;
		const data = await readApiResult(response);
		return data.license ?? null;
	} catch {
		return null;
	}
}
