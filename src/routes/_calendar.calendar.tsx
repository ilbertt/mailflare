import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(calendar)/calendar/page";

export const Route = createFileRoute("/_calendar/calendar")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
