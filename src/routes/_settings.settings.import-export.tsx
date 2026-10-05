import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/import-export/page";

export const Route = createFileRoute("/_settings/settings/import-export")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
