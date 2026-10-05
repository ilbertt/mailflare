import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/folders/[folderId]/page";

export const Route = createFileRoute("/_dashboard/folders/$folderId/")({ component: RouteComponent });

function RouteComponent() {
	return <Screen />;
}
