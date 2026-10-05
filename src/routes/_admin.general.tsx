import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/general/page";

export const Route = createFileRoute("/_admin/general")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
