import { Link as RouteLink } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import type { JSONParsed } from "hono/utils/types";
import type { LicenseStatus as ServerLicenseStatus } from "@/lib/licenses/types";
type LicenseStatus = JSONParsed<ServerLicenseStatus>;
import { loadLicenseIndicatorStatus } from "./license-indicator-utils";
import { LICENSE_STATUS_CHANGED_EVENT } from "@/lib/licenses/constants";

export function LicenseIndicator() {
	const [license, setLicense] = useState<LicenseStatus | null>(null);

	useEffect(() => {
		let cancelled = false;

		function load() {
			void loadLicenseIndicatorStatus().then((nextLicense) => {
				if (!cancelled) setLicense(nextLicense);
			});
		}

		load();
		window.addEventListener(LICENSE_STATUS_CHANGED_EVENT, load);
		return () => {
			cancelled = true;
			window.removeEventListener(LICENSE_STATUS_CHANGED_EVENT, load);
		};
	}, []);

	if (!license || license.active) return null;

	return (
		<RouteLink
				to="/licenses"
				className="rounded-full bg-blue-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-blue-900 hover:bg-blue-200"
			>
				Upgrade
			</RouteLink>
	);
}
