import type { JSONParsed } from "hono/utils/types";
import type { LicenseStatus as ServerLicenseStatus } from "@/lib/licenses/types";
type LicenseStatus = JSONParsed<ServerLicenseStatus>;

export type LicenseIndicatorResponse = {
	license?: LicenseStatus;
};
