import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/account/page";

export const Route = createFileRoute("/_settings/settings/account")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
