import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/inbox/layout";

export const Route = createFileRoute("/_dashboard/inbox")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
