import { readApiJson } from "@/lib/api/json";

import { apiRequest } from "@/lib/api/request";

import type { ApiKeyScope } from "@/lib/api/scopes";
import type { ManagedApiKey, McpKeyScope } from "./api-keys-settings-types";

export const MCP_KEY_SCOPES: { value: McpKeyScope; label: string; description: string }[] = [
	{ value: "mcp:read", label: "Read mail", description: "List, search, and read messages." },
	{ value: "mcp:draft", label: "Manage drafts", description: "Create, edit, and discard drafts." },
	{ value: "mcp:organize", label: "Organize mail", description: "Mark messages read and move them." },
	{ value: "mcp:request-send", label: "Request send review", description: "Propose a send that you must confirm in Mailflare." },
	{ value: "mcp:calendar-read", label: "Read calendar", description: "List, search, and inspect events and free time." },
	{ value: "mcp:calendar-write", label: "Manage calendar", description: "Create, update, and delete events." },
];

export const STANDARD_KEY_SCOPES: { value: ApiKeyScope; label: string; description: string }[] = [
	{ value: "read", label: "Read mail", description: "Read messages through the API." },
	{ value: "send", label: "Send mail", description: "Send messages directly through the API." },
	{ value: "calendar:read", label: "Read calendar", description: "Read your calendar events through the API." },
	{ value: "calendar:write", label: "Manage calendar", description: "Create, update, and delete your calendar events through the API." },
];

export function keyPermissions(key: ManagedApiKey): string[] {
	try {
		const scopes: unknown = JSON.parse(key.scopes);
		return Array.isArray(scopes) ? scopes.filter((scope): scope is string => typeof scope === "string") : [];
	} catch {
		return [];
	}
}

export async function loadManagedApiKeys(): Promise<ManagedApiKey[]> {
	const response = await apiRequest("/api/api-keys", { method: "GET" });
	const data = await readApiJson(response);
	if (!response.ok || !data.apiKeys) throw new Error(typeof data.error === "string" ? data.error : "Could not load API keys");
	return data.apiKeys;
}

export async function createManagedApiKey(input: { name: string; mcpAllowed: boolean; scopes: ApiKeyScope[] | McpKeyScope[]; mailboxIds: string[] }): Promise<string> {
	const response = input.mcpAllowed
        ? await apiRequest("/api/agent/mcp-keys", { method: "POST", json: { name: input.name, scopes: input.scopes.filter((scope): scope is McpKeyScope => scope.startsWith("mcp:")), mailboxIds: input.mailboxIds } })
        : await apiRequest("/api/api-keys", { method: "POST", json: { name: input.name, scopes: input.scopes.filter((scope): scope is ApiKeyScope => !scope.startsWith("mcp:")), mailboxIds: input.mailboxIds } });
	const data = await readApiJson(response);
	if (!response.ok || !data.key) throw new Error(typeof data.error === "string" ? data.error : "Could not create API key");
	return data.key;
}

export async function revokeManagedApiKey(id: string): Promise<void> {
	const response = await apiRequest("/api/api-keys", { method: "DELETE", query: `id=${encodeURIComponent(id)}` });
	if (!response.ok) {
		await readApiJson(response);
		throw new Error("Could not revoke API key");
	}
}
