import { createFileRoute } from "@tanstack/react-router";
import Screen from "@/components/screens/(dashboard)/folders/[folderId]/[messageId]/page";

export const Route = createFileRoute("/_dashboard/folders/$folderId/$messageId")({ component: RouteComponent });

function RouteComponent() {
	return <Screen messageId={Route.useParams().messageId} />;
}
