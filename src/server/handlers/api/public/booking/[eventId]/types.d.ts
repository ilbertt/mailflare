export type PublicBookingRouteContext = { params: Promise<{ eventId: string }> };
export type PublicBookingSubmission = { startsAt: string; name: string; email: string; guestEmails?: string; notes?: string };
