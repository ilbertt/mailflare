import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { AdminRoutingDomainsResponse } from "./types";

export async function fetchAdminRoutingDomains(): Promise<AdminRoutingDomainsResponse> {
	const response = await apiRequest("/api/domains", { method: "GET" });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error ?? "Unable to load domains");
	return { domains: data.domains ?? [] };
}
