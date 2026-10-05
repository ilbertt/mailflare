import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/starred/[messageId]/page";

export const Route = createFileRoute("/_dashboard/starred/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
