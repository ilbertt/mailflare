import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import { PROVIDER_BASE_URLS } from "@/lib/agent/provider-constants";
import type { AgentProviderPreset } from "@/lib/agent/provider-types";
import type { AgentAdminForm, AgentAdminModelsResponse, AgentAdminSettingsResponse, AgentEnabledResponse } from "./types";

export const PROVIDER_PRESETS: { id: AgentProviderPreset; label: string }[] = [
	{ id: "openai", label: "OpenAI" },
	{ id: "openrouter", label: "OpenRouter" },
	{ id: "groq", label: "Groq" },
	{ id: "custom", label: "Custom endpoint" },
];

export function baseUrlForPreset(preset: AgentProviderPreset, current = "") {
	return preset === "custom" ? current : PROVIDER_BASE_URLS[preset];
}

export function updateAgentModelRate(form: AgentAdminForm, model: string, kind: "input" | "output", value: string): AgentAdminForm {
	const current = form.rates[model] ?? { input: null, output: null };
	return { ...form, rates: { ...form.rates, [model]: { ...current, [kind]: value === "" ? null : Number(value) } } };
}

export async function loadAgentAdminSettings(): Promise<AgentAdminSettingsResponse> {
	const response = await apiRequest("/api/admin/agent", { method: "GET" });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error || "Could not load agent settings");
	return data;
}

export async function loadAgentModels(form: AgentAdminForm, signal?: AbortSignal): Promise<AgentAdminModelsResponse> {
	const response = await apiRequest("/api/admin/agent/models", { method: "POST", headers: { "Content-Type": "application/json" }, json: form, signal });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error || "Could not load models");
	return data;
}

export async function saveAgentAdminSettings(form: AgentAdminForm): Promise<AgentAdminSettingsResponse> {
	const response = await apiRequest("/api/admin/agent", { method: "PUT", headers: { "Content-Type": "application/json" }, json: form });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error || "Could not save agent settings");
	return data;
}

export async function saveAgentEnabled(enabled: boolean): Promise<AgentEnabledResponse> {
	const response = await apiRequest("/api/admin/agent", { method: "PUT", headers: { "Content-Type": "application/json" }, json: { enabled } });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error || "Could not update assistant availability");
	return data;
}
