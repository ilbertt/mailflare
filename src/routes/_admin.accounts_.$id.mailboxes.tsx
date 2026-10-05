import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/accounts/[id]/mailboxes/page";

export const Route = createFileRoute("/_admin/accounts_/$id/mailboxes")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
