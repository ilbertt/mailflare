import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { formatUserDate } from "@/lib/time/utils";
import type { ActivityLog, ActivityMetadata } from "./types";

export async function fetchActivity(): Promise<ActivityLog[]> {
	const res = await apiRequest("/api/activity", { method: "GET" });
	const json = await readApiResult(res);
	if (!res.ok) throw new Error(json.error ?? "Failed to load activity");
	return json.activities ?? [];
}

export function formatActivityDate(value: string): string {
	return formatUserDate(value, {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export function getActivityLabel(action: string): string {
	if (action === "auth.login") return "Login";
	if (action === "auth.logout") return "Logout";
	return action;
}

export function getActivityMetadata(log: ActivityLog): ActivityMetadata {
	if (!log.metadata) return {};
	try {
		return JSON.parse(log.metadata) as ActivityMetadata;
	} catch {
		return {};
	}
}
