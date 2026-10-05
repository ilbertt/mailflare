import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/import/page";

export const Route = createFileRoute("/_settings/settings/import")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
