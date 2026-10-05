import DraftsPage from "../page";
import { OpenDraftOnRoute } from "./open-draft-on-route";
import { useParams } from "@tanstack/react-router";

export default function DraftMessagePage() {
	const { messageId } = useParams({ from: "/_dashboard/drafts_/$messageId" });
	return <><DraftsPage /><OpenDraftOnRoute draftId={messageId} /></>;
}
