import { hc } from "hono/client";
import type { AppType } from "@/server/api";
import { authFetch } from "@/lib/auth/client";

/** Only AppType crosses the boundary; no server modules enter the browser bundle. */
export const apiClient = hc<AppType>("/", { fetch: authFetch });

export async function fetchSetupStatus() {
	const response = await apiClient.api.setup.status.$get();
	if (!response.ok) throw new Error("Could not load setup status");
	return response.json();
}
