import type { InferRequestType } from "hono/client";
import { endpoints } from "./endpoints";
import type { AuthFetchOptions } from "@/lib/auth/client-types";

type Endpoints = typeof endpoints;
type MethodKey<M extends string> = `$${Lowercase<M>}`;
type Method<P extends keyof Endpoints, M extends string> = MethodKey<M> extends keyof Endpoints[P] ? Endpoints[P][MethodKey<M>] : never;
type Callable = (...args: never[]) => unknown;
type Arguments<P extends keyof Endpoints, M extends string> = Method<P, M> extends Callable ? InferRequestType<Method<P, M>> : never;
type Result<P extends keyof Endpoints, M extends string> = Method<P, M> extends Callable ? ReturnType<Method<P, M>> : never;
type Query = string | URLSearchParams | Record<string, string | undefined>;
type BodyArguments<P extends keyof Endpoints, M extends string> = P extends "/api/send" ? Omit<Arguments<P, M>, "json"> & ({ json: Arguments<P, M> extends { json: infer J } ? J : never; body?: never } | { body: FormData; json?: never }) : Arguments<P, M>;
type Options<P extends keyof Endpoints, M extends string> = BodyArguments<P, M> & Omit<AuthFetchOptions, "method" | "body"> & {
	method: M;
	query?: Query;
	authenticated?: boolean;
	body?: P extends "/api/send" ? FormData : Arguments<P, M> extends { json: unknown } ? never : FormData;
};

/** Typed paths, HTTP methods, parameters, JSON inputs, and responses from the server. */
export function apiRequest<const P extends keyof Endpoints, const M extends "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "OPTIONS" | "HEAD">(path: P, options: { method: M } & Omit<Options<P, NoInfer<M>>, "method">): Result<P, M> {
	const { method, param, query, json, authenticated = true, body, headers, ...init } = options as Options<P, M> & { param?: Record<string, string>; json?: unknown };
	const queryValues = typeof query === "string" || query instanceof URLSearchParams
		? Object.fromEntries(new URLSearchParams(query))
		: query;
	const requestHeaders = new Headers(headers);
	// Hono serializes json itself. Multipart requests retain the browser's boundary.
	if (body instanceof FormData) requestHeaders.delete("Content-Type");
	const endpoint = endpoints[path] as unknown as Record<string, (args: object, options: object) => unknown>;
	return endpoint[`$${method.toLowerCase()}`]({ param, query: queryValues, json }, {
		headers: Object.fromEntries(requestHeaders),
		init: { ...init, ...(body === undefined ? {} : { body }) },
		...(authenticated ? {} : { fetch }),
	}) as Result<P, M>;
}
