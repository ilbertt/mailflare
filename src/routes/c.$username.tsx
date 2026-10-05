import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/c/[username]/page";

export const Route = createFileRoute("/c/$username")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
