import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/rules/page";

export const Route = createFileRoute("/_settings/settings/rules")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
