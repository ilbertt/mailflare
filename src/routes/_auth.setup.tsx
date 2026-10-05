import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(auth)/setup/page";

export const Route = createFileRoute("/_auth/setup")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
