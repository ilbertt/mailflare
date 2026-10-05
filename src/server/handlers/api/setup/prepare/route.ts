import { ApiResponse } from "@/server/http/response";
import { hasAdminAccount } from "@/lib/auth/setup";
import { getEnv } from "@/lib/cloudflare";
import { getSetupRequirementChecks } from "@/lib/setup/configuration";
import { migrateCleanDatabase } from "@/lib/setup/migration";

export async function POST() {
	const env = getEnv();
	if (await hasAdminAccount(env)) {
		return ApiResponse.json({ error: "Initial setup is already complete" }, { status: 403 });
	}

	const checks = getSetupRequirementChecks(env);
	if (checks.some((check) => !check.configured)) {
		return ApiResponse.json({ checks, migrated: false }, { status: 503 });
	}

	try {
		const migrated = await migrateCleanDatabase(env.DB);
		return ApiResponse.json({ checks, migrated });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Database preparation failed";
		return ApiResponse.json({ checks, migrated: false, error: message }, { status: 500 });
	}
}
