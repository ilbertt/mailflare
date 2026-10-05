import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/archived/page";

export const Route = createFileRoute("/_dashboard/archived/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
