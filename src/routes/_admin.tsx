import { requireProtectedRoute } from "@/lib/auth/route-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/layout";

export const Route = createFileRoute("/_admin")({ beforeLoad: ({ location }) => requireProtectedRoute(location.pathname, true, true), component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
