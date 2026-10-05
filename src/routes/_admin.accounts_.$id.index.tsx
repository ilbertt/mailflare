import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/[id]/page";

export const Route = createFileRoute("/_admin/accounts_/$id/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
