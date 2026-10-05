import { readApiResult } from "@/lib/api/json";
import type { HttpResponse } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";

type SetupResponse = { error?: string; code?: string; records?: { content: string; priority: number }[] };

/** Whether a response is a 409 MX_CONFLICT the user agreed to resolve by replacing the listed MX records. */
export function confirmMxReplacement(response: HttpResponse, data: SetupResponse): boolean {
	if (response.status !== 409 || data.code !== "MX_CONFLICT") return false;
	const list = (data.records ?? []).map((record) => `  ${record.priority} ${record.content}`).join("\n");
	return window.confirm(`${data.error}\n\n${list}\n\nReplace them? Mail will stop going to the current service.`);
}

/**
 * Runs a receiving provider's setup. Other MX records would shadow the new one,
 * so the server refuses (409) until the user agrees to replace them.
 * Returns false when the user declined.
 */
export async function runReceivingSetup(domainId: string, provider: "cloudflare" | "resend" | "ses"): Promise<boolean> {
	const call = async (replaceMx: boolean) => {
		const response = await apiRequest("/api/domains/:id/receiving/:provider", { method: "POST", headers: { "Content-Type": "application/json" }, json: { replaceMx }, param: { id: domainId, provider: provider } });
		return { response, data: await readApiResult(response) };
	};
	let { response, data } = await call(false);
	if (response.status === 409 && data.code === "MX_CONFLICT") {
		if (!confirmMxReplacement(response, data)) return false;
		({ response, data } = await call(true));
	}
	if (!response.ok) throw new Error(data.error ?? "Setup failed");
	return true;
}
