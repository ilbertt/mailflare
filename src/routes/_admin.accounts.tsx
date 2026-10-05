import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/page";

export const Route = createFileRoute("/_admin/accounts")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
