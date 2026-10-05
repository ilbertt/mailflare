import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(auth)/onboarding/page";

export const Route = createFileRoute("/_auth/onboarding")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
