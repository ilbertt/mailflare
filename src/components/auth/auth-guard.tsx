import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { useLocation } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { AuthGuardProps } from "./auth-guard-types";
import { LoadingTransition } from "@/components/loading-transition";
import { saveUserTimeZonePreference } from "@/lib/time/client";

export function AuthGuard({ children, mode = "protected", requireMailbox, requireRole, requirePrimary, allowAuthenticated }: AuthGuardProps) {
	const pathname = useLocation({ select: (location) => location.pathname });
	const router = useRouter();
	const [authorized, setAuthorized] = useState(mode === "public");
	const [sessionError, setSessionError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setSessionError(null);
		if (mode === "protected") setAuthorized(false);

		async function checkSession() {
			try {
				const cookieResponse = await apiRequest("/api/auth/me", { method: "GET", cache: "no-store", signal: AbortSignal.timeout(5_000), authenticated: false });
				const response = cookieResponse.ok || cookieResponse.status !== 401
					? cookieResponse
					: await apiRequest("/api/auth/me", { method: "GET", redirectOnUnauthorized: false, signal: AbortSignal.timeout(5_000) });
				if (cancelled) return;

				if (!response.ok) {
					if (mode === "protected" && response.status === 401) router.navigate({ to: "/login", replace: true });
					else if (mode === "public") setAuthorized(true);
					else throw new Error("Could not check your session. Please try again.");
					return;
				}

				const data = await readApiResult(response);
				if (data.user?.id) saveUserTimeZonePreference(data.user.id, data.user.timeZone ?? null);
				if (mode === "public") {
					if (!allowAuthenticated) router.navigate({ to: "/inbox", replace: true });
					return;
				}

				if (requireMailbox && data.hasMailboxes === false && data.user?.role === "admin" && data.isSetup === false && pathname !== "/setup") {
					router.navigate({ to: "/setup", replace: true });
					return;
				}

				if (pathname === "/setup" && data.isSetup === true) {
					router.navigate({ to: "/inbox", replace: true });
					return;
				}

				if (requireRole && data.user?.role !== requireRole) {
					router.navigate({ to: "/inbox", replace: true });
					return;
				}

				if (requirePrimary && !data.user?.isPrimaryAdmin) {
					router.navigate({ to: "/admin", replace: true });
					return;
				}

				setAuthorized(true);
			} catch (error) {
				if (!cancelled) setSessionError(error instanceof Error ? error.message : "Could not check your session");
			}
		}

		void checkSession();

		return () => {
			cancelled = true;
		};
	}, [mode, pathname, requireMailbox, requireRole, requirePrimary, allowAuthenticated, router]);

	if (mode === "public") return <>{children}</>;
	if (sessionError) return <div className="p-8" role="alert"><p>{sessionError}</p><button onClick={() => window.location.reload()}>Try again</button></div>;
	return <LoadingTransition ready={authorized}>{children}</LoadingTransition>;
}
