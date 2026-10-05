import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/activity/page";

export const Route = createFileRoute("/_admin/activity")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
