import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(auth)/register/page";

export const Route = createFileRoute("/_auth/register")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
