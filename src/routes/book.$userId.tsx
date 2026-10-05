import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/book/[userId]/page";

export const Route = createFileRoute("/book/$userId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
