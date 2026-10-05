import { ApiResponse } from "@/server/http/response";

const accountsRemovedResponse = () =>
	ApiResponse.json({ error: "Multiple accounts are not available in this build" }, { status: 410 });

export async function GET() {
	return accountsRemovedResponse();
}

export async function POST() {
	return accountsRemovedResponse();
}

export async function DELETE() {
	return accountsRemovedResponse();
}
