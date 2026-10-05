import { readApiResult } from "@/lib/api/json";
import { apiRequest } from "@/lib/api/request";
import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";

export function SpamFilterSettings() {
	const [enabled, setEnabled] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void apiRequest("/api/settings/spam", { method: "GET" })
			.then(async (response) => {
				const data = await readApiResult(response);
				if (!response.ok) throw new Error(data.error ?? "Failed to load spam filter settings");
				setEnabled(data.enabled !== false);
			})
			.catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Failed to load spam filter settings"))
			.finally(() => setLoading(false));
	}, []);

	async function updateEnabled(nextEnabled: boolean) {
		const previous = enabled;
		setEnabled(nextEnabled);
		setLoading(true);
		setError(null);
		try {
			const response = await apiRequest("/api/settings/spam", { method: "PATCH", headers: { "Content-Type": "application/json" }, json: { enabled: nextEnabled } });
			const data = await readApiResult(response);
			if (!response.ok) throw new Error(data.error ?? "Failed to update spam filter settings");
			setEnabled(data.enabled !== false);
		} catch (nextError) {
			setEnabled(previous);
			setError(nextError instanceof Error ? nextError.message : "Failed to update spam filter settings");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<label className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
				<span className="flex-1">
					<span className="block text-sm font-medium text-neutral-900">Spam Filter</span>
					<span className="mt-1 block text-sm text-neutral-500">Analyze incoming messages locally and detect high-confidence spam</span>
				</span>
				<Switch checked={enabled} disabled={loading} onCheckedChange={(value) => void updateEnabled(value)} aria-label="Enable spam filter" />
			</label>
			{error && <p className="mt-2 px-4 text-sm text-red-600">{error}</p>}
		</div>
	);
}
