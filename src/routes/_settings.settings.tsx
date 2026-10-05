import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/layout";

export const Route = createFileRoute("/_settings/settings")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
