import { Navigate } from "@tanstack/react-router";

export default function SettingsPage() {
	return <Navigate to={"/settings/account"} replace />;
}
