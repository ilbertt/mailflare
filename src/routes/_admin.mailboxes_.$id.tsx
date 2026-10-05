import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/mailboxes/[id]/page";

export const Route = createFileRoute("/_admin/mailboxes_/$id")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
