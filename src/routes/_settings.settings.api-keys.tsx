import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/api-keys/page";

export const Route = createFileRoute("/_settings/settings/api-keys")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
