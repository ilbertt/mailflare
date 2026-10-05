import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/[id]/permissions/page";

export const Route = createFileRoute("/_admin/accounts_/$id/permissions")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
