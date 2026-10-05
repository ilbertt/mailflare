import type { MessageAttachment } from "@/components/screens/(dashboard)/inbox/[messageId]/types";

export interface MessageAttachmentViewerProps {
	attachment: MessageAttachment | null;
	messageId: string;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export type AttachmentPreviewKind =
	| "audio"
	| "image"
	| "pdf"
	| "text"
	| "unsupported"
	| "video";
