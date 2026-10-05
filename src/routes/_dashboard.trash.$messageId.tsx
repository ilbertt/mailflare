import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/trash/[messageId]/page";

export const Route = createFileRoute("/_dashboard/trash/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
