import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/book/[userId]/[eventId]/page";

export const Route = createFileRoute("/book/$userId_/$eventId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
