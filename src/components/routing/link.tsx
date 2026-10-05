import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { useRouter } from "@tanstack/react-router";

/** Links to complete URLs supplied by mail records or navigation configuration. */
const AppLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function AppLink({ href, onClick, ...props }, ref) {
	const router = useRouter();
	return <a {...props} href={href} ref={ref} onClick={(event) => {
		onClick?.(event);
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target && props.target !== "_self" || props.download !== undefined || !href?.startsWith("/") || href.startsWith("//")) return;
		event.preventDefault();
		void router.navigate({ href });
	}} />;
});

export default AppLink;
