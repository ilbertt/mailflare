import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/agent/review/[id]/page";

export const Route = createFileRoute("/_dashboard/agent/review/$id")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
