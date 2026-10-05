import type { LucideIcon } from "lucide-react";
import type { JSONParsed } from "hono/utils/types";
import type { LicenseStatus as ServerLicenseStatus } from "@/lib/licenses/types";
type LicenseStatus = JSONParsed<ServerLicenseStatus>;

export type LicensePlan = {
	name: string;
	price: number;
	description: string;
	features: string[];
	icon: LucideIcon;
	checkoutUrl: string;
	originalPrice?: number,
};

export type LicenseAction = "activate" | "validate" | "deactivate";

export type ActivatableLicensePlan = "pro" | "team";

export type LicenseResponse = {
	license?: LicenseStatus;
	error?: string;
};
