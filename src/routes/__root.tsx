import { createRootRoute } from "@tanstack/react-router";
import { AppRoot, NotFound, RouteError } from "@/components/routing/root";

export const Route = createRootRoute({ component: RouteComponent, notFoundComponent: NotFound, errorComponent: RouteError });

function RouteComponent() {
	return <AppRoot />;
}
