import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { isValidTimeZone } from "@/lib/time/utils";

export function listTimeZones(deviceTimeZone: string): string[] {
	const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
	return [...new Set(["UTC", deviceTimeZone, ...supported])].sort((a, b) => a.localeCompare(b));
}

export function formatCurrentTimeInZone(timeZone: string): string {
	return new Intl.DateTimeFormat(undefined, { timeZone, dateStyle: "full", timeStyle: "short" }).format(new Date());
}

export async function updateUserTimeZone(value: string): Promise<string | null> {
	const timeZone = value.trim() || null;
	if (timeZone && !isValidTimeZone(timeZone)) throw new Error("Choose a valid timezone, such as Asia/Ho_Chi_Minh");
	const response = await apiRequest("/api/settings/time-zone", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: { timeZone } });
	const data = await readApiResult(response);
	if (!response.ok) throw new Error(data.error || "Could not save timezone");
	return data.timeZone ?? null;
}
