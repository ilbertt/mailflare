import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/agent/page";

export const Route = createFileRoute("/_admin/agent")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
