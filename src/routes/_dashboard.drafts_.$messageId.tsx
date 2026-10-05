import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/drafts/[messageId]/page";

export const Route = createFileRoute("/_dashboard/drafts_/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
