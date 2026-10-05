import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/security/page";

export const Route = createFileRoute("/_settings/settings/security")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
