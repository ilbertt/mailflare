import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/trash/page";

export const Route = createFileRoute("/_dashboard/trash/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
