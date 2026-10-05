import { createRouter } from "@tanstack/react-router";
import { RouteLoadingBar } from "@/components/route-loading-bar";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({ routeTree, scrollRestoration: true, defaultPreload: "intent", defaultPendingComponent: RouteLoadingBar });

declare module "@tanstack/react-router" {
	interface Register { router: typeof router }
}
