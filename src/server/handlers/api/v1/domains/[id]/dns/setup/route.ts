import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/cloudflare";
import { getDb } from "@/db";
import { domains } from "@/db/schema";
import { authenticateAdminApiKey } from "@/lib/api/admin-auth";
import { getDomainForUser } from "@/lib/domains/service";
import { getDomainDnsView } from "@/lib/domains/dns-view";
import type { DnsAuthRecord } from "@/lib/domains/dns-audit";
import { setupDomainDnsRecord } from "@/lib/domains/dns-setup";
import { MxConflictError } from "@/lib/domains/receiving-dns";

type Params = { params: Promise<{ id: string }> };

const DNS_RECORDS: DnsAuthRecord[] = ["mx", "spf", "dkim", "dmarc"];

export async function POST(request: ApiRequest<POSTInput>, { params }: Params) {
	const env = getEnv();
	const auth = await authenticateAdminApiKey(env, request, "domains");
	if (!auth) {
		return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const domain = await getDomainForUser(env, auth.userId, id);
	if (!domain) return ApiResponse.json({ error: "Not found" }, { status: 404 });

	const body = (await request.json().catch(() => ({}))) as { record?: string; replaceMx?: boolean };
	const record = body.record as DnsAuthRecord | undefined;
	if (!record || !DNS_RECORDS.includes(record)) {
		return ApiResponse.json({ error: "Unknown DNS record" }, { status: 400 });
	}

	try {
		await setupDomainDnsRecord(env, domain, record, { replaceMx: body.replaceMx === true });
		const dns = await getDomainDnsView(env, domain);
		const [updated] = await getDb(env)
			.select()
			.from(domains)
			.where(eq(domains.id, domain.id))
			.limit(1);
		return ApiResponse.json({
			domain: { ...(updated ?? domain), sendingEnabled: dns.sendingEnabled },
			dns,
		});
	} catch (err) {
		// 409 MX_CONFLICT asks the caller to confirm and retry with replaceMx.
		if (err instanceof MxConflictError) return ApiResponse.json({ error: err.message, code: err.code, records: err.records }, { status: 409 });
		const message = err instanceof Error ? err.message : "Failed to set up DNS record";
		return ApiResponse.json({ error: message }, { status: 500 });
	}
}

export type POSTInput = { record?: string; replaceMx?: boolean };
