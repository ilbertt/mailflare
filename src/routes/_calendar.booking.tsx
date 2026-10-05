import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(calendar)/booking/page";

export const Route = createFileRoute("/_calendar/booking")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
