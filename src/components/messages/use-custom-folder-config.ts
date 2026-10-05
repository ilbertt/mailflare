import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { Folder } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelectedMailbox } from "@/components/mailbox-provider";

import type { MessageFolderConfig } from "./types";

export function useCustomFolderConfig(folderId: string): MessageFolderConfig {
	const { selectedMailbox } = useSelectedMailbox();
	const [folderName, setFolderName] = useState("Folder");

	useEffect(() => {
		if (!selectedMailbox?.id) return;
		let cancelled = false;
		const search = new URLSearchParams({ mailboxId: selectedMailbox.id });

		apiRequest("/api/folders", { method: "GET", query: `${search.toString()}` })
			.then((response) => readApiJson(response))
			.then((data) => {
				if (cancelled) return;
				const folder = data.folders?.find((item) => item.id === folderId);
				if (folder) setFolderName(folder.name);
			})
			.catch(() => {});

		return () => {
			cancelled = true;
		};
	}, [folderId, selectedMailbox?.id]);

	return useMemo(
		() => ({
			folder: "inbox",
			folderId,
			title: folderName,
			emptyText: "No emails in this folder",
			hrefPrefix: `/folders/${folderId}`,
			icon: Folder,
			showRowBadge: false,
		}),
		[folderId, folderName],
	);
}
