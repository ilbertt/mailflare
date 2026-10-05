import { requireProtectedRoute } from "@/lib/auth/route-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(calendar)/layout";

export const Route = createFileRoute("/_calendar")({ beforeLoad: ({ location }) => requireProtectedRoute(location.pathname, false, true), component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
