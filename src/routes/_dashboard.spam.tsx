import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/spam/layout";

export const Route = createFileRoute("/_dashboard/spam")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
