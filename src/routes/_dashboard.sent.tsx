import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/sent/layout";

export const Route = createFileRoute("/_dashboard/sent")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
