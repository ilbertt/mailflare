import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/spam/[messageId]/page";

export const Route = createFileRoute("/_dashboard/spam/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
