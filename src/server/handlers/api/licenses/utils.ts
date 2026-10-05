import { ApiResponse, type JsonResponse } from "@/server/http/response";
import { z } from "zod";
import { assertPrimaryAdmin } from "@/lib/auth/admin";
import { requireUser } from "@/lib/auth/cookies";
import type { LicenseKeyRequest } from "./types";

const licenseKeySchema = z.object({
	licenseKey: z.string().trim().min(1).max(500),
	plan: z.enum(["pro", "team"]).optional(),
});

export async function requireLicenseAdmin(env: CloudflareEnv, request: Request): Promise<JsonResponse<{error: string}, 403> | null> {
	try {
		assertPrimaryAdmin(await requireUser(env, request));
		return null;
	} catch {
		return ApiResponse.json({ error: "Forbidden" }, { status: 403 });
	}
}

export async function parseLicenseKeyRequest(request: Request): Promise<LicenseKeyRequest> {
	return licenseKeySchema.parse(await request.json());
}

export function getLicenseInstanceUrl(request: Request): string {
	return new URL(request.url).origin;
}

export function getLicenseErrorResponse(error: unknown) {
	if (error instanceof z.ZodError) {
		return ApiResponse.json({ error: "Enter a valid license key" }, { status: 400 });
	}
	const message = error instanceof Error ? error.message : "License request failed";
	const migrationMissing = /no such table|license_settings/i.test(message);
	return ApiResponse.json(
		{ error: migrationMissing ? "Apply the latest database migration before activating a license" : message },
		{ status: migrationMissing ? 503 : 400 },
	);
}

export type parseLicenseKeyRequestInput = z.input<typeof licenseKeySchema>;
