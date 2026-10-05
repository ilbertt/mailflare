import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { deactivateLicense } from "@/lib/licenses/service";
import { getLicenseErrorResponse, requireLicenseAdmin } from "../utils";

export async function POST(request: Request) {
	const env = getEnv();
	const forbidden = await requireLicenseAdmin(env, request);
	if (forbidden) return forbidden;

	try {
		const license = await deactivateLicense(env);
		return ApiResponse.json({ license });
	} catch (error) {
		return getLicenseErrorResponse(error);
	}
}
