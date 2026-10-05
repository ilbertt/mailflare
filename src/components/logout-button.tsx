import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { logoutClientSession } from "@/lib/auth/logout";

export function LogoutButton() {
	const router = useRouter();
	return (
		<Button
			variant="outline"
			className="w-full"
			onClick={async () => {
				const switched = await logoutClientSession();
				router.navigate({ href: switched ? "/inbox" : "/login", replace: true });
				router.invalidate();
			}}
		>
			Log out
		</Button>
	);
}
