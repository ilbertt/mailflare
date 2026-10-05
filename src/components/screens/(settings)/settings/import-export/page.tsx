import { Navigate } from "@tanstack/react-router";

export default function SettingsImportExportRedirectPage() {
	return <Navigate to={"/settings/import"} replace />;
}
