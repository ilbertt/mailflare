import type { z } from "zod";
import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { getEnv } from "@/lib/cloudflare";
import { authenticateApiKey, requireScope } from "@/lib/api/auth";
import { sendEmailSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email/send";
import { decodeBase64Content } from "@/lib/email/attachments";
import { readJsonBody } from "@/lib/http/request";
import { RequestBodyTooLargeError } from "@/lib/http/errors";
import { getSendErrorStatus } from "@/server/handlers/api/send/error-utils";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	const auth = await authenticateApiKey(env, request.headers.get("authorization"));
	if (!auth || !requireScope(auth.scopes, "send")) {
		return ApiResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await readJsonBody(request, 40 * 1024 * 1024);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: "Invalid send request" }, { status });
	}
	const parsed = sendEmailSchema.safeParse(body);
	if (!parsed.success) {
		return ApiResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}
	if (auth.mailboxIds && !auth.mailboxIds.includes(parsed.data.mailboxId)) {
		return ApiResponse.json({ error: "Mailbox not found" }, { status: 404 });
	}

	try {
		const { attachments, ...fields } = parsed.data;
		const result = await sendEmail(env, {
			userId: auth.userId,
			...fields,
			publicOrigin: new URL(request.url).origin,
			attachments: attachments?.map((attachment) => ({
				filename: attachment.filename,
				type: attachment.type,
				content: decodeBase64Content(attachment.contentBase64),
				disposition: "attachment",
			})),
		});
		return ApiResponse.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Send failed";
		return ApiResponse.json({ error: message }, { status: getSendErrorStatus(message) });
	}
}

export type POSTInput = z.input<typeof sendEmailSchema>;
