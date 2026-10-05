import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { InboxRule, InboxRuleInput, InboxRulesResponse, RuleFoldersResponse } from "./inbox-rules-types";

export async function fetchInboxRules(mailboxId: string): Promise<InboxRulesResponse> {
	const params = new URLSearchParams({ mailboxId });
	const response = await apiRequest("/api/routing-rules", { method: "GET", query: `${params.toString()}` });
	const data = await readApiJson(response);
	return { rules: data.rules.filter((rule): rule is typeof rule & InboxRule => ["email", "content", "title"].includes(rule.matchField) && ["contains", "exact"].includes(rule.matchOperator)) };
}

export async function fetchRuleFolders(mailboxId: string): Promise<RuleFoldersResponse> {
	const params = new URLSearchParams({ mailboxId });
	const response = await apiRequest("/api/folders", { method: "GET", query: `${params.toString()}` });
	return await readApiJson(response);
}

export async function createInboxRule(input: InboxRuleInput) {
	const response = await apiRequest("/api/routing-rules", { method: "POST", headers: { "Content-Type": "application/json" }, json: input });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Failed to create rule");
	return;
}

export async function updateInboxRule(ruleId: string, input: InboxRuleInput) {
	const response = await apiRequest("/api/routing-rules/:id", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: input, param: { id: ruleId } });
	const data = await readApiJson(response);
	if (!response.ok) throw new Error(data.error ?? "Failed to update rule");
	return;
}

export async function deleteInboxRule(ruleId: string) {
	const response = await apiRequest("/api/routing-rules/:id", { method: "DELETE", param: { id: ruleId } });
	if (!response.ok) throw new Error("Failed to delete rule");
}

export function getRuleFieldLabel(field: string): string {
	if (field === "content") return "Content";
	if (field === "title") return "Title";
	return "Email address";
}

export function getRuleOperatorLabel(operator: string): string {
	return operator === "exact" ? "exact match" : "contains";
}

export function getInboxRuleDestination(rule: Pick<InboxRule, "action" | "folderId">): string {
	if (rule.action === "spam" || rule.action === "trash") return rule.action;
	return rule.folderId ? `folder:${rule.folderId}` : "";
}
