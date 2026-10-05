import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/drafts/page";

export const Route = createFileRoute("/_dashboard/drafts")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
