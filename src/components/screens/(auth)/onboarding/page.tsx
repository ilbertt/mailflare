import { Navigate } from "@tanstack/react-router";

export default function OnboardingPage() {
	return <Navigate to={"/setup"} replace />;
}
