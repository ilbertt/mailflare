import { readApiResult, readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { clearClientSessionToken } from "@/lib/auth/client";
import type {
	DomainSetupResult,
	MxCheckResult,
	RegisterResult,
	SetupPreparationResult,
	SetupStatus,
} from "./types";

export async function prepareSetup(): Promise<{ ok: boolean; data: SetupPreparationResult }> {
	const res = await apiRequest("/api/setup/prepare", { method: "POST", authenticated: false });
	return {
		ok: res.ok,
		data: await readApiResult(res),
	};
}

export async function getSetupStatus(): Promise<SetupStatus> {
	const res = await apiRequest("/api/setup/status", { method: "GET", authenticated: false });
	const data = await readApiJson(res);
	return data;
}

export async function submitPrimaryDomain(hostname: string): Promise<{ ok: boolean; data: DomainSetupResult }> {
	const res = await apiRequest("/api/setup/domain", { method: "POST", headers: { "Content-Type": "application/json" }, json: { hostname }, authenticated: false });

	return {
		ok: res.ok,
		data: await readApiResult(res),
	};
}

export async function checkExistingMx(hostname: string): Promise<{ ok: boolean; data: MxCheckResult }> {
	const res = await apiRequest("/api/setup/domain/mx", { method: "POST", headers: { "Content-Type": "application/json" }, json: { hostname }, authenticated: false });

	return {
		ok: res.ok,
		data: await readApiResult(res),
	};
}

export async function submitRegistration(
	form: FormData,
	payload: { firstRun: boolean; domain: string; enableSending?: boolean; replaceMxRecords?: boolean },
): Promise<{ ok: boolean; data: RegisterResult }> {
	const res = await apiRequest("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, json: {
        domain: payload.domain,
        enableSending: payload.enableSending,
        replaceMxRecords: payload.replaceMxRecords,
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
        resetEmail: String(form.get("resetEmail") ?? ""),
        turnstileToken: String(form.get("turnstileToken") ?? ""),
    }, authenticated: false });

	const data = await readApiResult(res);
	if (res.ok) clearClientSessionToken();
	return { ok: res.ok, data };
}
