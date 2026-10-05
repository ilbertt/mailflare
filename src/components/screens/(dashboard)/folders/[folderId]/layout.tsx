import { useParams } from "@tanstack/react-router";
import { MessageSplitLayout } from "@/components/messages/message-split-layout";
import { useCustomFolderConfig } from "@/components/messages/use-custom-folder-config";

export default function CustomFolderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams({ from: "/_dashboard/folders/$folderId" });
	const config = useCustomFolderConfig(params.folderId);

	return <MessageSplitLayout config={config}>{children}</MessageSplitLayout>;
}
