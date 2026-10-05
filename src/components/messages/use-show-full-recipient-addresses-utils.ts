import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

export async function loadShowFullRecipientAddresses(): Promise<boolean> {
 const data = await readApiJson(await apiRequest("/api/settings/recipient-addresses", { method: "GET" }));
 return data.enabled;
}
export async function updateShowFullRecipientAddresses(enabled: boolean): Promise<boolean> {
 const data = await readApiJson(await apiRequest("/api/settings/recipient-addresses", { method: "PATCH", json: { enabled } }));
 return data.enabled;
}
