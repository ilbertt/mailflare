import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/snoozed/[messageId]/page";

export const Route = createFileRoute("/_dashboard/snoozed/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
