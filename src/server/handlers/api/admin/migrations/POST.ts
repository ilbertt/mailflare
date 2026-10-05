import { ApiResponse } from "@/server/http/response";
import { applyPendingMigrations } from "@/lib/migrations/service";
import { authorizeMigrationRequest } from "./utils";

export async function POST(request: Request) {
	const authorization = await authorizeMigrationRequest(request);
	if (authorization.error) return authorization.error;

	try {
		return ApiResponse.json(await applyPendingMigrations(authorization.env.DB));
	} catch (error) {
		return ApiResponse.json(
			{ error: error instanceof Error ? error.message : "Could not apply database migrations" },
			{ status: 500 },
		);
	}
}
