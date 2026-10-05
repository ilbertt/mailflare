import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/import-export/page";

export const Route = createFileRoute("/_dashboard/import-export")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
