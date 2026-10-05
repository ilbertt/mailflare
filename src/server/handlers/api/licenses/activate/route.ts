import type { parseLicenseKeyRequestInput } from "../utils";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { activateLicense } from "@/lib/licenses/service";
import {
	getLicenseErrorResponse,
	getLicenseInstanceUrl,
	parseLicenseKeyRequest,
	requireLicenseAdmin,
} from "../utils";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const forbidden = await requireLicenseAdmin(env, request);
	if (forbidden) return forbidden;

	try {
		const { licenseKey, plan } = await parseLicenseKeyRequest(request);
		if (!plan) return ApiResponse.json({ error: "Choose Pro or Team" }, { status: 400 });
		const license = await activateLicense(env, licenseKey, getLicenseInstanceUrl(request), plan);
		return ApiResponse.json({ license });
	} catch (error) {
		return getLicenseErrorResponse(error);
	}
}

export type POSTInput = parseLicenseKeyRequestInput;
