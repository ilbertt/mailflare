import { requireProtectedRoute } from "@/lib/auth/route-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/layout";

export const Route = createFileRoute("/_settings")({ beforeLoad: ({ location }) => requireProtectedRoute(location.pathname, false, false), component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
