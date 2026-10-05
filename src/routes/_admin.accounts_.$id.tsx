import { createFileRoute, Outlet } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/[id]/layout";

export const Route = createFileRoute("/_admin/accounts_/$id")({ component: RouteComponent });

function RouteComponent() {
	return <Screen><Outlet /></Screen>;
}
