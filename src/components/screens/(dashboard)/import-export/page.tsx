import { Navigate } from "@tanstack/react-router";

export default function ImportExportRedirectPage() {
	return <Navigate to={"/settings/import"} replace />;
}
