import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { createContext, useContext, useEffect, useState } from "react";

import type { MailboxSelectorUser } from "@/components/mailbox-selector-types";
import type { HomeAuthProviderProps } from "./types";

const HomeAuthContext = createContext<MailboxSelectorUser | null>(null);

export function HomeAuthProvider({ children }: HomeAuthProviderProps) {
	const [user, setUser] = useState<MailboxSelectorUser | null>(null);

	useEffect(() => {
		let cancelled = false;
		void apiRequest("/api/auth/me", { method: "GET", redirectOnUnauthorized: false })
			.then(async (response) => response.ok ? await readApiResult(response) : null)
			.then((data) => {
				if (!cancelled) setUser(data?.user ?? null);
			})
			.catch(() => {
				if (!cancelled) setUser(null);
			});
		return () => { cancelled = true; };
	}, []);

	return <HomeAuthContext.Provider value={user}>{children}</HomeAuthContext.Provider>;
}

export function useHomeAuth() {
	return useContext(HomeAuthContext);
}
