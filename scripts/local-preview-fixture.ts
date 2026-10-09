import { getDb } from '../src/db';
import { users, domains, mailboxes, messages, calendarEvents, bookingEvents, messageAttachments } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth/password';
import { applyPendingMigrations } from '../src/lib/migrations/service';

/** Used only by the local CLI; no seeding endpoint is exposed by the production Worker. */
export async function seedLocalPreview(env: CloudflareEnv) {
 const migrated = await applyPendingMigrations(env.DB);
 console.log(`Applied ${migrated.applied.length} local migration(s).`);
 const db = getDb(env);
 const now = new Date();
 const passwordHash = hashPassword('local-preview-password');
 await db.insert(users).values([
  { id: 'local-admin', email: 'admin@mailflare.test', name: 'Local Admin', role: 'admin', isPrimaryAdmin: true, canManageMailboxes: true, canManageDomains: true, canManageUsers: true, bookingUsername: 'local-admin', timeZone: 'Europe/Rome', passwordHash },
  { id: 'local-member', email: 'member@mailflare.test', name: 'Local Member', role: 'user', bookingUsername: 'local-member', timeZone: 'Europe/Rome', passwordHash },
 ]).onConflictDoNothing();
 await db.insert(domains).values({ id: 'local-domain', userId: 'local-admin', hostname: 'mailflare.test', zoneId: 'local-simulation', status: 'active', routingEnabled: true, sendingRequested: true, sendingEnabled: true, sendingProvider: 'cloudflare' }).onConflictDoNothing();
 await db.insert(mailboxes).values([
  { id: 'local-admin-mailbox', userId: 'local-admin', domainId: 'local-domain', localPart: 'admin', displayName: 'Local Admin' },
  { id: 'local-support-mailbox', userId: 'local-admin', domainId: 'local-domain', localPart: 'support', displayName: 'Support' },
  { id: 'local-member-mailbox', userId: 'local-member', domainId: 'local-domain', localPart: 'member', displayName: 'Local Member' },
 ]).onConflictDoNothing();
 const folders = ['received', 'sent', 'draft', 'archived', 'spam', 'trash', 'snoozed'] as const;
 for (const [index, status] of folders.entries()) await db.insert(messages).values({
  id: `local-${status}`, userId: 'local-admin', mailboxId: 'local-admin-mailbox',
  direction: status === 'sent' || status === 'draft' ? 'outbound' as const : 'inbound' as const,
  status, fromAddr: status === 'sent' || status === 'draft' ? 'admin@mailflare.test' : 'sender@example.test',
  toAddr: status === 'sent' || status === 'draft' ? 'recipient@example.test' : 'admin@mailflare.test',
  subject: status === 'received' ? 'Welcome to the local Cloudflare preview' : `Sample ${status} message`,
  textBody: 'This sample message is stored in local D1. Its attachment is stored in local R2.',
  snippet: 'Sample mail for testing the production SPA and Worker.', read: status !== 'received', starred: status === 'received',
  snoozedUntil: status === 'snoozed' ? new Date(now.getTime() + 86_400_000) : null,
  providerMessageId: `<local-${status}@mailflare.test>`, threadId: `<local-${status}@mailflare.test>`,
  createdAt: new Date(now.getTime() - index * 3_600_000),
 }).onConflictDoNothing();
 await db.insert(messages).values({ id: 'local-member-message', userId: 'local-member', mailboxId: 'local-member-mailbox', direction: 'inbound', status: 'received', fromAddr: 'sender@example.test', toAddr: 'member@mailflare.test', subject: 'Member account inbox', textBody: 'This message belongs to the regular user.', read: false }).onConflictDoNothing();
 const content = new TextEncoder().encode('Hello from the local R2 bucket.\n');
 const r2Key = 'local-preview/welcome.txt';
 if (!(await env.BUCKET.head(r2Key))) await env.BUCKET.put(r2Key, content, { httpMetadata: { contentType: 'text/plain' } });
 await db.insert(messageAttachments).values({ id: 'local-attachment', messageId: 'local-received', filename: 'welcome.txt', contentType: 'text/plain', size: content.byteLength, r2Key }).onConflictDoNothing();
 const startsAt = new Date(now); startsAt.setDate(startsAt.getDate() + 1); startsAt.setHours(10, 0, 0, 0);
 await db.insert(calendarEvents).values({ id: 'local-calendar-event', userId: 'local-admin', mailboxId: 'local-admin-mailbox', title: 'Local preview review', description: 'Sample calendar event.', startsAt, endsAt: new Date(startsAt.getTime() + 1_800_000), timeZone: 'Europe/Rome' }).onConflictDoNothing();
 await db.insert(bookingEvents).values({ id: 'local-booking', userId: 'local-admin', name: 'Preview meeting', slug: 'preview-meeting', description: 'Try the public booking flow against local D1.', durationMinutes: 30, hostIds: '["local-admin"]', timeZone: 'Europe/Rome' }).onConflictDoNothing();
}
