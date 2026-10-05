import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/admin/page";

export const Route = createFileRoute("/_admin/admin")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
