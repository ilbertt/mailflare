import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/archived/layout";

export const Route = createFileRoute("/_dashboard/archived")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
