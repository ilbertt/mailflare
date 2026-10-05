import { ApiResponse } from "@/server/http/response";
import { authorizeAdminRequest, getUpdateStatus } from "./utils";

export async function GET(request: Request) {
	const authorization = await authorizeAdminRequest(request);
	if (authorization.error) return authorization.error;

	try {
		return ApiResponse.json(await getUpdateStatus(authorization.env));
	} catch (error) {
		const message = error instanceof Error ? error.message : "Could not check for updates";
		const status = message.includes("must be configured") ? 503 : 502;
		return ApiResponse.json({ error: message }, { status });
	}
}