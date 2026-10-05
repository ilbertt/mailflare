import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/webhooks/page";

export const Route = createFileRoute("/_admin/webhooks")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
