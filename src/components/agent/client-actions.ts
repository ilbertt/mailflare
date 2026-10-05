import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

import type { ReviewSnapshot } from "./send-review-types";

export async function requestDraftReview(draftId: string, expectedRevision: number): Promise<{ approvalId: string; snapshot: ReviewSnapshot }> {
	const response = await apiRequest("/api/agent/approvals", { method: "POST", headers: { "Content-Type": "application/json" }, json: { draftId, expectedRevision } });
	const result = await readApiResult(response);
	if (!response.ok || !result.approvalId || !result.snapshot) throw new Error(result.error || "Could not open draft review");
	return { approvalId: result.approvalId, snapshot: result.snapshot };
}

export async function approveAgentAction(toolMessageId: string): Promise<Record<string, unknown>> {
	const response = await apiRequest("/api/agent/actions/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, json: { toolMessageId } });
	const result = await readApiResult(response);
	if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not approve action");
	return result;
}
