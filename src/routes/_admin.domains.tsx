import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/domains/page";

export const Route = createFileRoute("/_admin/domains")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
