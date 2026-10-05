import { Navigate } from "@tanstack/react-router";

export default function AuditLogsRedirectPage() {
	return <Navigate to={"/activity"} replace />;
}
