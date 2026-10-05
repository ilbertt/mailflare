import { Navigate } from "@tanstack/react-router";

export default function RulesPage() {
	return <Navigate to={"/settings/account"} replace />;
}
