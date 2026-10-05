import { useLocation } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { ComposeForm } from "@/components/compose/compose-form";
import { useCompose } from "@/components/compose/compose-context";

export function FloatingComposer() {
	const { open, draftId, closeComposer } = useCompose();
	const pathname = useLocation({ select: (location) => location.pathname });
	const router = useRouter();
	if (!open) return null;
	return <ComposeForm key={draftId ?? "new"} mode="popup" draftIdToLoad={draftId} onClose={() => {
		closeComposer();
		if (/^\/drafts\/[^/]+\/?$/.test(pathname)) router.navigate({ to: "/drafts", replace: true });
	}} />;
}
