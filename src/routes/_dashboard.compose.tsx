import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/compose/page";

export const Route = createFileRoute("/_dashboard/compose")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
