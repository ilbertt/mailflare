import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/c/[username]/[slug]/page";

export const Route = createFileRoute("/c/$username_/$slug")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
