import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/starred/layout";

export const Route = createFileRoute("/_dashboard/starred")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
