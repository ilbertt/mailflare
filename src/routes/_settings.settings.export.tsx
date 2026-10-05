import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/export/page";

export const Route = createFileRoute("/_settings/settings/export")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
