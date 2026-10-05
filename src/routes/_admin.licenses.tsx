import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/licenses/page";

export const Route = createFileRoute("/_admin/licenses")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
