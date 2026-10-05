import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import type { MigrationStatusResponse, UpdateStatusResponse, UpdateWorkflowResponse } from "./admin-update-card-types";

export async function getApplicationUpdateStatus(): Promise<UpdateStatusResponse> {
	const response = await apiRequest("/api/admin/update", { method: "GET", cache: "no-store", authenticated: false });
	const data = await readApiJson(response);

	if (!response.ok) {
		throw new Error(data.error ?? "Could not check for updates");
	}

	return data;
}

export async function triggerApplicationUpdate(): Promise<UpdateWorkflowResponse> {
	const response = await apiRequest("/api/admin/update", { method: "POST", authenticated: false });
	const data = await readApiJson(response);

	if (!response.ok) {
		throw new Error(data.error ?? "Could not start the update");
	}

	return data;
}

export async function getMigrationStatus(): Promise<MigrationStatusResponse> {
	const response = await apiRequest("/api/admin/migrations", { method: "GET", cache: "no-store", authenticated: false });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Could not check database migrations");
	return data;
}

export async function applyDatabaseMigrations(): Promise<MigrationStatusResponse> {
	const response = await apiRequest("/api/admin/migrations", { method: "POST", authenticated: false });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Could not apply database migrations");
	return data;
}
