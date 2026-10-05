import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/page";

export const Route = createFileRoute("/_settings/settings/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
