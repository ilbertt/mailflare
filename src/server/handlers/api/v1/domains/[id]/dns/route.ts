import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { authenticateAdminApiKey } from "@/lib/api/admin-auth";
import { getDomainForUser } from "@/lib/domains/service";
import { getDomainDnsView } from "@/lib/domains/dns-view";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
	const env = getEnv();
	const auth = await authenticateAdminApiKey(env, request, "domains");
	if (!auth) {
		return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const domain = await getDomainForUser(env, auth.userId, id);
	if (!domain) return ApiResponse.json({ error: "Not found" }, { status: 404 });

	try {
		const dns = await getDomainDnsView(env, domain);
		return ApiResponse.json({
			domain: { ...domain, sendingEnabled: dns.sendingEnabled },
			dns,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to fetch DNS";
		return ApiResponse.json({ error: message }, { status: 500 });
	}
}
