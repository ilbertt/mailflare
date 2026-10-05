import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/sent/[messageId]/page";

export const Route = createFileRoute("/_dashboard/sent/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
