import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/audit-logs/page";

export const Route = createFileRoute("/_admin/audit-logs")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
