import { Navigate, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LoginClient } from "./login-client";
import { fetchSetupStatus } from "@/lib/api/client";
import { LoaderCircle } from "lucide-react";

export default function LoginPage() {
	const adding = new URLSearchParams(useLocation({ select: (location) => location.searchStr })).get("add") === "1";
	const setup = useQuery({ queryKey: ["setup-status"], queryFn: fetchSetupStatus, staleTime: 0 });
	if (setup.isPending) return <LoaderCircle className="m-8 h-6 w-6 animate-spin" aria-label="Loading" />;
	if (setup.error) throw setup.error;
	if (!setup.data.hasAdminAccount) return <Navigate to="/setup" replace />;
	return <AuthGuard mode="public" allowAuthenticated={adding}><LoginClient adding={adding} /></AuthGuard>;
}
