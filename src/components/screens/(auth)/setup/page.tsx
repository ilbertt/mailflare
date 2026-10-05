import { Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/auth-guard";
import { OnboardingClient } from "../onboarding/onboarding-client";
import { RegisterClient } from "../register/register-client";
import { fetchSetupStatus } from "@/lib/api/client";
import { LoaderCircle } from "lucide-react";

export default function SetupPage() {
	const setup = useQuery({ queryKey: ["setup-status"], queryFn: fetchSetupStatus, staleTime: 0 });
	if (setup.isPending) return <LoaderCircle className="m-8 h-6 w-6 animate-spin" aria-label="Loading" />;
	if (setup.error) throw setup.error;
	if (!setup.data.hasAdminAccount) return <AuthGuard mode="public"><RegisterClient /></AuthGuard>;
	if (setup.data.hasPrimaryDomain) return <Navigate to="/inbox" replace />;
	return <AuthGuard requireRole="admin"><OnboardingClient /></AuthGuard>;
}
