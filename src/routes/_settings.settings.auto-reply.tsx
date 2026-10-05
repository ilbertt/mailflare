import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/auto-reply/page";

export const Route = createFileRoute("/_settings/settings/auto-reply")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
