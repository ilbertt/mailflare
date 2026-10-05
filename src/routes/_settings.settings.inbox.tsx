import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/inbox/page";

export const Route = createFileRoute("/_settings/settings/inbox")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
