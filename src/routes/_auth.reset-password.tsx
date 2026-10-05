import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(auth)/reset-password/page";

export const Route = createFileRoute("/_auth/reset-password")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
