import { serialize } from "hono/utils/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import type { JSONParsed } from "hono/utils/types";
import type { TypedResponse } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Carries the actual JSON payload and status into the RPC client's inferred types. */
export class JsonResponse<T, S extends number = 200> extends Response implements TypedResponse<JSONParsed<T>, S & ContentfulStatusCode, "json"> {
	declare readonly _data: JSONParsed<T>;
	declare readonly _status: S & ContentfulStatusCode;
	declare readonly _format: "json";
	readonly cookies = {
		set: (name: string, value: string, options: CookieOptions = {}) => {
			this.headers.append("Set-Cookie", serialize(name, value, options));
		},
	};
}

export const ApiResponse = {
	json<T, S extends number = 200>(data: T, init?: Omit<ResponseInit, "status"> & { status?: S }): JsonResponse<T, S> {
		const headers = new Headers(init?.headers);
		if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=utf-8");
		return new JsonResponse(JSON.stringify(data), { ...init, headers });
	},
};
