import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/snoozed/layout";

export const Route = createFileRoute("/_dashboard/snoozed")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
