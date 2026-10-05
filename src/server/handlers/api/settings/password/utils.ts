import type { z } from "zod";
import { changePasswordSchema } from "@/lib/validators";
import type { ChangePasswordInput } from "./types";

export async function parseChangePasswordRequest(request: Request): Promise<ChangePasswordInput> {
	const body = await request.json();
	return changePasswordSchema.parse(body);
}

export type parseChangePasswordRequestInput = z.input<typeof changePasswordSchema>;
