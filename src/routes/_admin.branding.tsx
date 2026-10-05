import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(admin)/branding/page";

export const Route = createFileRoute("/_admin/branding")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
