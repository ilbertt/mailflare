import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/sent/page";

export const Route = createFileRoute("/_dashboard/sent/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
