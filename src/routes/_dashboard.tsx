import { requireProtectedRoute } from "@/lib/auth/route-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/layout";

export const Route = createFileRoute("/_dashboard")({ beforeLoad: ({ location }) => requireProtectedRoute(location.pathname, false, true), component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
