import type { JsonResponse } from "./response";
import type { Handler } from "hono";
import type { ApiRequest } from "@/shared/api-request";

export type ApiEnv = { Bindings: CloudflareEnv };
/** Errors returned by app.onError, including authentication and malformed JSON. */
type BoundaryError = JsonResponse<{ error: string }, 400 | 401 | 403 | 500>;
type RequestHandler = (...args: never[]) => Response | Promise<Response>;
type HandlerInput<F extends RequestHandler> = Parameters<F> extends [infer R, ...unknown[]]
	? "__apiInput" extends keyof R ? R extends ApiRequest<infer T>
	? { in: { json: T }; out: { json: T } }
	: Record<never, never> : Record<never, never> : Record<never, never>;

/** Keeps handler input/output inference while adapting standard HTTP requests to Hono. */
export function adaptHandler<F extends RequestHandler>(handler: F): Handler<ApiEnv, string, HandlerInput<F>, ReturnType<F> | BoundaryError> {
	return ((context) => {
		const params = context.req.param();
		// The original handlers validate request bodies themselves. This boundary only
		// supplies the request and path params; it does not bypass their validation.
		const invoke = handler as unknown as (request: Request, context: { params: Promise<Record<string, string>> }) => ReturnType<F>;
		return invoke(context.req.raw, { params: Promise.resolve(params) });
	}) as Handler<ApiEnv, string, HandlerInput<F>, ReturnType<F> | BoundaryError>;
}
