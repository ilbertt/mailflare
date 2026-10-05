import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { requireUser } from "@/lib/auth/cookies";
import { canManageDomains } from "@/lib/auth/admin";
import { addDomainSchema } from "@/lib/validators";
import { addDomainForUser, listUserDomains } from "@/lib/domains/service";
import type { DnsStatusSummary } from "@/lib/dns-status";
import { summariseDomainDns } from "@/lib/domains/dns-view";
import { getDomainProvisioningError } from "@/lib/domains/errors";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";

export async function GET(request: Request) {
	const env = getEnv();
	const user = await requireUser(env, request);
	const domainOwnerId = user.canManageMailboxes && user.createdByUserId ? user.createdByUserId : user.id;
	const domains = await listUserDomains(env, domainOwnerId);

	const includeDns = new URL(request.url).searchParams.get("includeDns") === "true";

	const dns: Record<string, DnsStatusSummary> = {};
	let domainViews = domains;
	if (includeDns) {
		const results = await Promise.allSettled(
			domains.map(async (domain) => {
				const { summary, sendingEnabled } = await summariseDomainDns(env, domain);
				return { id: domain.id, summary, sendingEnabled };
			}),
		);
		const sendingEnabledByDomain = new Map<string, boolean>();
		for (const r of results) {
			if (r.status === "fulfilled") {
				dns[r.value.id] = r.value.summary;
				sendingEnabledByDomain.set(r.value.id, r.value.sendingEnabled);
			}
		}
		domainViews = domains.map((domain) => ({
			...domain,
			sendingEnabled: sendingEnabledByDomain.get(domain.id) ?? domain.sendingEnabled,
		}));
	}

	return ApiResponse.json({ domains: domainViews, dns: includeDns ? dns : undefined });
}

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const user = await requireUser(env, request);
	if (!canManageDomains(user)) return ApiResponse.json({ error: "Forbidden" }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return ApiResponse.json({ error: "Invalid origin" }, { status: 403 });
	const parsed = addDomainSchema.safeParse(await request.json());
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	try {
		const result = await addDomainForUser(env, user.id, parsed.data.hostname, {
			enableRouting: parsed.data.enableRouting,
			enableSending: parsed.data.enableSending,
			replaceMxRecords: parsed.data.replaceMxRecords,
			receivingProvider: parsed.data.receivingProvider,
			sendingProvider: parsed.data.sendingProvider,
		});
		return ApiResponse.json(result);
	} catch (err) {
		const failure = getDomainProvisioningError(err, "Failed to add domain");
		return ApiResponse.json(
			{ error: failure.message, code: failure.code },
			{ status: failure.status },
		);
	}
}

export type POSTInput = z.input<typeof addDomainSchema>;
