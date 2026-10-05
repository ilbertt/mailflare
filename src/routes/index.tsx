import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/page";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
