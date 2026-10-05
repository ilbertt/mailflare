import { readApiResult } from "@/lib/api/json";
import type { HttpResponse } from "@/lib/api/json";
import { getUserTimeZone } from "@/lib/time/utils";
import { clearUserTimeZonePreference } from "@/lib/time/client";
import type { AuthFetchOptions, AuthSessionChangedDetail } from "./client-types";

const SESSION_STORAGE_KEY = "mailflare-session-token";
export const AUTH_SESSION_CHANGED_EVENT = "mailflare:auth-session-changed";

function dispatchAuthSessionChanged(authenticated: boolean): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<AuthSessionChangedDetail>(AUTH_SESSION_CHANGED_EVENT, {
			detail: { authenticated },
		}),
	);
}

export function getClientSessionToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setClientSessionToken(token: string): void {
	const previousToken = localStorage.getItem(SESSION_STORAGE_KEY);
	localStorage.setItem(SESSION_STORAGE_KEY, token);
	if (previousToken !== token) clearUserTimeZonePreference();
	if (previousToken !== token) dispatchAuthSessionChanged(true);
}

export function clearClientSessionToken(): void {
	localStorage.removeItem(SESSION_STORAGE_KEY);
	clearUserTimeZonePreference();
	dispatchAuthSessionChanged(false);
}

export function getAuthHeaders(headers?: HeadersInit): Headers {
	const nextHeaders = new Headers(headers);
	if (typeof window !== "undefined" && !nextHeaders.has("X-Time-Zone")) {
		nextHeaders.set("X-Time-Zone", getUserTimeZone());
	}
	const token = getClientSessionToken();
	if (token && !nextHeaders.has("Authorization")) {
		nextHeaders.set("Authorization", `Bearer ${token}`);
	}
	return nextHeaders;
}

export async function authFetch(input: RequestInfo | URL, init: AuthFetchOptions = {}): Promise<Response> {
	const { redirectOnUnauthorized = true, headers, ...requestInit } = init;
	const response = await fetch(input, {
		...requestInit,
		headers: getAuthHeaders(headers),
	});

	if (response.status === 401 && redirectOnUnauthorized && typeof window !== "undefined") {
		clearClientSessionToken();
		window.location.assign("/login");
	}

	return response;
}

export async function persistAuthSession<R extends HttpResponse>(response: R) {
 const data = await readApiResult(response);
 if (response.ok && "token" in data && typeof data.token === "string") setClientSessionToken(data.token);
 return data;
}
