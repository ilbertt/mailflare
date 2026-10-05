import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { seedDemoData } from "@/lib/seed";
import { demoCredentials } from "@/lib/seed-utils";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return ApiResponse.json({ error: "Not available in production" }, { status: 403 });
	}
	const env = getEnv();
	const result = await seedDemoData(env);
	return ApiResponse.json({
		ok: true,
		credentials: demoCredentials,
		seeded: result,
	});
}
