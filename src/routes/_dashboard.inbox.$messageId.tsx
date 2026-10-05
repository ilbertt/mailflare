import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/inbox/[messageId]/page";

export const Route = createFileRoute("/_dashboard/inbox/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
