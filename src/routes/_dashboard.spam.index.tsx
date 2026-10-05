import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/spam/page";

export const Route = createFileRoute("/_dashboard/spam/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
