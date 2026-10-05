import { useLocation } from "@tanstack/react-router";

import { AdminNav } from "@/components/admin-nav";
import { DashboardNav } from "@/components/dashboard-nav";

const adminPrefixes = ["/admin", "/mailboxes", "/domains", "/api-keys", "/activity", "/audit-logs", "/webhooks", "/branding", "/licenses"];

export function DashboardShellNav() {
	const pathname = useLocation({ select: (location) => location.pathname });
	const isAdmin = adminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

	return isAdmin ? <AdminNav /> : <DashboardNav />;
}
