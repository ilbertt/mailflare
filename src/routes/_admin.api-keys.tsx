import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/api-keys/page";

export const Route = createFileRoute("/_admin/api-keys")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
