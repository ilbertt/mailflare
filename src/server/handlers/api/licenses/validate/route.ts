import type { parseLicenseKeyRequestInput } from "../utils";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { validateLicense } from "@/lib/licenses/service";
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
		const { licenseKey } = await parseLicenseKeyRequest(request);
		const license = await validateLicense(env, licenseKey, getLicenseInstanceUrl(request));
		return ApiResponse.json({ license });
	} catch (error) {
		return getLicenseErrorResponse(error);
	}
}

export type POSTInput = parseLicenseKeyRequestInput;
