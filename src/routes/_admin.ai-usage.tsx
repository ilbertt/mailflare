import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/ai-usage/page";

export const Route = createFileRoute("/_admin/ai-usage")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
