import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(settings)/settings/app-passwords/page";

export const Route = createFileRoute("/_settings/settings/app-passwords")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
