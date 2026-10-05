import { Navigate } from "@tanstack/react-router";

export default function SettingsAutoReplyPage() {
	return <Navigate to={"/settings/inbox"} replace />;
}
