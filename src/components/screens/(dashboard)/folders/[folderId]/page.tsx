import { useParams } from "@tanstack/react-router";
import { MessageFolderPage } from "@/components/messages/message-folder-page";
import { useCustomFolderConfig } from "@/components/messages/use-custom-folder-config";

export default function CustomFolderPage() {
	const params = useParams({ from: "/_dashboard/folders/$folderId" });
	const config = useCustomFolderConfig(params.folderId);

	return <MessageFolderPage config={config} />;
}
