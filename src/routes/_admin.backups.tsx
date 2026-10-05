import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/backups/page";

export const Route = createFileRoute("/_admin/backups")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
