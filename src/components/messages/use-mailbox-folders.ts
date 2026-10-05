import { readApiJson } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { useEffect, useState } from "react";

import type { CustomFolder } from "@/components/dashboard-nav-types";

// Shared across toolbars so reopening a menu shows the folders immediately instead of popping in.
const cache = new Map<string, CustomFolder[]>();

export function useMailboxFolders(mailboxId: string | undefined): CustomFolder[] {
	const [fetched, setFetched] = useState<{ mailboxId: string; folders: CustomFolder[] } | null>(null);

	useEffect(() => {
		if (!mailboxId) return;
		let cancelled = false;
		apiRequest("/api/folders", { method: "GET", query: `${new URLSearchParams({ mailboxId }).toString()}` })
			.then((response) => readApiJson(response))
			.then((data) => {
				const folders = data.folders ?? [];
				cache.set(mailboxId, folders);
				if (!cancelled) setFetched({ mailboxId, folders });
			})
			.catch(() => undefined);
		return () => { cancelled = true; };
	}, [mailboxId]);

	if (!mailboxId) return [];
	return fetched?.mailboxId === mailboxId ? fetched.folders : cache.get(mailboxId) ?? [];
}
