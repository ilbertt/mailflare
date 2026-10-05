import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/routing/page";

export const Route = createFileRoute("/_admin/routing")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
