import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/mailboxes/page";

export const Route = createFileRoute("/_admin/mailboxes")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
