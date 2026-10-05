import type { ApiRequest } from "@/shared/api-request";
import { ApiResponse } from "@/server/http/response";
import { requireUser } from "@/lib/auth/cookies";
import { getEnv } from "@/lib/cloudflare";
import { RequestBodyTooLargeError } from "@/lib/http/errors";
import { readJsonBody } from "@/lib/http/request";
import { listImapFolders } from "@/lib/import/imap";
import type { ImapFolderListRequest } from "./types";
import { parseImapFolderListRequest } from "./utils";

export async function POST(request: ApiRequest<POSTInput>) {
	const env = getEnv();
	await requireUser(env, request);
	let input: ReturnType<typeof parseImapFolderListRequest>;
	try {
		const body = await readJsonBody<ImapFolderListRequest>(request, 16 * 1024);
		input = parseImapFolderListRequest(body);
	} catch (error) {
		const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
		return ApiResponse.json({ error: error instanceof Error ? error.message : "Invalid IMAP folder request" }, { status });
	}

	try {
		const folders = await listImapFolders(input);
		return ApiResponse.json({ folders });
	} catch (error) {
		return ApiResponse.json(
			{ error: error instanceof Error ? error.message : "Unable to list IMAP folders" },
			{ status: 502 },
		);
	}
}

export type POSTInput = ImapFolderListRequest;
