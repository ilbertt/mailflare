import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/trash/layout";

export const Route = createFileRoute("/_dashboard/trash")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
