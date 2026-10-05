import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/archived/[messageId]/page";

export const Route = createFileRoute("/_dashboard/archived/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
