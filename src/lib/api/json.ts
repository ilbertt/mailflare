import type { SuccessStatusCode } from "hono/utils/http-status";

export type HttpResponse = { ok: boolean; status: number; headers: Headers; body: ReadableStream<Uint8Array> | null; json(): Promise<unknown> };
type Json<R> = R extends { json(): Promise<infer T> } ? T : never;
type Success<R> = R extends { status: infer S } ? S extends SuccessStatusCode ? Json<R> : never : never;

export function apiErrorMessage(data: unknown, fallback = "Request failed"): string {
	if (data && typeof data === "object" && "error" in data) {
		if (typeof data.error === "string") return data.error;
		if (data.error && typeof data.error === "object" && "fieldErrors" in data.error) {
			const messages = Object.values(data.error.fieldErrors as Record<string, unknown>).flat().filter((message): message is string => typeof message === "string");
			if (messages.length) return messages.join(". ");
		}
	}
	return fallback;
}

/** Success payloads are inferred from HTTP status; error payloads become exceptions. */
export async function readApiJson<R extends HttpResponse>(response: R): Promise<Success<R> & { error?: string }> {
	const data = await response.json();
	if (!response.ok) throw new Error(apiErrorMessage(data));
	return data as Success<R> & { error?: string };
}

type UnionKeys<T> = T extends unknown ? keyof T : never;
type UnionValue<T, K extends PropertyKey> = T extends unknown ? K extends keyof T ? T[K] : never : never;
/** Keys absent in some HTTP outcomes are optional, so callers must check them. */
export type ApiResult<T> = { [K in Exclude<keyof T, "error">]: UnionValue<T, K> } & { [K in Exclude<UnionKeys<T>, keyof T | "error">]?: UnionValue<T, K> } & { error?: string };

/** For workflows that handle non-success statuses themselves (MFA, MX conflicts). */
export async function readApiResult<R extends HttpResponse>(response: R): Promise<ApiResult<Json<R>>> {
	const data = await response.json();
	if (data && typeof data === "object" && "error" in data) {
		return { ...data, error: apiErrorMessage(data) } as ApiResult<Json<R>>;
	}
	return data as ApiResult<Json<R>>;
}
