import { Outlet } from "@tanstack/react-router";
import { Providers } from "@/components/providers";

export function AppRoot() {
	return <Providers><Outlet /></Providers>;
}

export function NotFound() {
	return <main className="p-8"><h1 className="text-xl font-semibold">Page not found</h1><a href="/inbox">Open inbox</a></main>;
}

export function RouteError({ error }: { error: unknown }) {
	return <main className="p-8"><h1 className="text-xl font-semibold">Could not open this page</h1><p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
}
