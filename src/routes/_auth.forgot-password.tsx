import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(auth)/forgot-password/page";

export const Route = createFileRoute("/_auth/forgot-password")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
