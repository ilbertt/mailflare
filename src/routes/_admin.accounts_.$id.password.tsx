import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/[id]/password/page";

export const Route = createFileRoute("/_admin/accounts_/$id/password")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
