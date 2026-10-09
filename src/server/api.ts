// Every HTTP endpoint is registered here; AppType is inferred from its handlers.
import { Hono } from "hono";
import { adaptHandler } from "./http/handler";
import type { ApiEnv } from "./http/handler";
import * as route0 from "@/server/handlers/mcp/route";
import * as route1 from "@/server/handlers/api/accounts/route";
import * as route2 from "@/server/handlers/api/activity/route";
import * as route3 from "@/server/handlers/api/api-keys/route";
import * as route4 from "@/server/handlers/api/attachment-policy/route";
import * as route5 from "@/server/handlers/api/audit-logs/route";
import * as route6 from "@/server/handlers/api/backups/route";
import * as route7 from "@/server/handlers/api/booking/route";
import * as route8 from "@/server/handlers/api/branding/route";
import * as route9 from "@/server/handlers/api/contacts/route";
import * as route10 from "@/server/handlers/api/domains/route";
import * as route11 from "@/server/handlers/api/drafts/route";
import * as route12 from "@/server/handlers/api/folders/route";
import * as route13 from "@/server/handlers/api/inbound/route";
import * as route14 from "@/server/handlers/api/licenses/route";
import * as route15 from "@/server/handlers/api/mailboxes/route";
import * as route16 from "@/server/handlers/api/messages/route";
import * as route17 from "@/server/handlers/api/routing-rules/route";
import * as route18 from "@/server/handlers/api/seed/route";
import * as route19 from "@/server/handlers/api/send/route";
import * as route20 from "@/server/handlers/api/templates/route";
import * as route21 from "@/server/handlers/api/webhooks/route";
import * as route22 from "@/server/handlers/api/accounts/[id]/route";
import * as route23 from "@/server/handlers/api/admin/agent/route";
import * as route24 from "@/server/handlers/api/admin/ai-usage/route";
import * as route25 from "@/server/handlers/api/admin/api-keys/route";
import * as route26 from "@/server/handlers/api/admin/aws/route";
import * as route27 from "@/server/handlers/api/admin/general/route";
import * as route28 from "@/server/handlers/api/admin/migrations/route";
import * as route29 from "@/server/handlers/api/admin/resend-key/route";
import * as route30 from "@/server/handlers/api/admin/search-index/route";
import * as route31 from "@/server/handlers/api/admin/update/route";
import * as route32 from "@/server/handlers/api/agent/approvals/route";
import * as route33 from "@/server/handlers/api/agent/availability/route";
import * as route34 from "@/server/handlers/api/agent/chat/route";
import * as route35 from "@/server/handlers/api/agent/conversations/route";
import * as route36 from "@/server/handlers/api/agent/jobs/route";
import * as route37 from "@/server/handlers/api/agent/mcp-keys/route";
import * as route38 from "@/server/handlers/api/agent/settings/route";
import * as route39 from "@/server/handlers/api/auth/accounts/route";
import * as route40 from "@/server/handlers/api/auth/login/route";
import * as route41 from "@/server/handlers/api/auth/logout/route";
import * as route42 from "@/server/handlers/api/auth/me/route";
import * as route43 from "@/server/handlers/api/auth/register/route";
import * as route44 from "@/server/handlers/api/auth/switch/route";
import * as route45 from "@/server/handlers/api/backups/[id]/route";
import * as route46 from "@/server/handlers/api/backups/restore/route";
import * as route47 from "@/server/handlers/api/booking/[eventId]/route";
import * as route48 from "@/server/handlers/api/booking/settings/route";
import * as route49 from "@/server/handlers/api/branding/icon/route";
import * as route50 from "@/server/handlers/api/calendar/events/route";
import * as route51 from "@/server/handlers/api/contacts/avatar/route";
import * as route52 from "@/server/handlers/api/contacts/block/route";
import * as route53 from "@/server/handlers/api/domains/[id]/route";
import * as route54 from "@/server/handlers/api/domains/check/route";
import * as route55 from "@/server/handlers/api/drafts/[id]/route";
import * as route56 from "@/server/handlers/api/export/messages/route";
import * as route57 from "@/server/handlers/api/import/imap/route";
import * as route58 from "@/server/handlers/api/import/messages/route";
import * as route59 from "@/server/handlers/api/inbound/resend/route";
import * as route60 from "@/server/handlers/api/inbound/ses/route";
import * as route61 from "@/server/handlers/api/licenses/activate/route";
import * as route62 from "@/server/handlers/api/licenses/deactivate/route";
import * as route63 from "@/server/handlers/api/licenses/validate/route";
import * as route64 from "@/server/handlers/api/mailboxes/[id]/route";
import * as route65 from "@/server/handlers/api/messages/[messageId]/route";
import * as route66 from "@/server/handlers/api/messages/bulk/route";
import * as route67 from "@/server/handlers/api/messages/counts/route";
import * as route68 from "@/server/handlers/api/messages/empty/route";
import * as route69 from "@/server/handlers/api/messages/navigation/route";
import * as route70 from "@/server/handlers/api/profile/avatar/route";
import * as route71 from "@/server/handlers/api/public/booking/route";
import * as route72 from "@/server/handlers/api/routing-rules/[id]/route";
import * as route73 from "@/server/handlers/api/routing-rules/domain/route";
import * as route74 from "@/server/handlers/api/settings/forwarding/route";
import * as route75 from "@/server/handlers/api/settings/mfa/route";
import * as route76 from "@/server/handlers/api/settings/password/route";
import * as route77 from "@/server/handlers/api/settings/profile/route";
import * as route78 from "@/server/handlers/api/settings/recipient-addresses/route";
import * as route79 from "@/server/handlers/api/settings/shortcuts/route";
import * as route80 from "@/server/handlers/api/settings/spam/route";
import * as route81 from "@/server/handlers/api/settings/time-zone/route";
import * as route82 from "@/server/handlers/api/settings/trash-retention/route";
import * as route83 from "@/server/handlers/api/setup/domain/route";
import * as route84 from "@/server/handlers/api/setup/prepare/route";
import * as route85 from "@/server/handlers/api/setup/status/route";
import * as route86 from "@/server/handlers/api/shared-files/[id]/route";
import * as route87 from "@/server/handlers/api/templates/[id]/route";
import * as route88 from "@/server/handlers/api/v1/accounts/route";
import * as route89 from "@/server/handlers/api/v1/domains/route";
import * as route90 from "@/server/handlers/api/v1/mailboxes/route";
import * as route91 from "@/server/handlers/api/v1/messages/route";
import * as route92 from "@/server/handlers/api/v1/send/route";
import * as route93 from "@/server/handlers/api/webhooks/[id]/route";
import * as route94 from "@/server/handlers/api/accounts/[id]/avatar/route";
import * as route95 from "@/server/handlers/api/accounts/[id]/mailbox-access/route";
import * as route96 from "@/server/handlers/api/accounts/[id]/mailboxes/route";
import * as route97 from "@/server/handlers/api/accounts/[id]/transfer-primary/route";
import * as route98 from "@/server/handlers/api/admin/agent/models/route";
import * as route99 from "@/server/handlers/api/agent/actions/confirm/route";
import * as route100 from "@/server/handlers/api/agent/approvals/[id]/route";
import * as route101 from "@/server/handlers/api/agent/conversations/[id]/route";
import * as route102 from "@/server/handlers/api/auth/mfa/verify/route";
import * as route103 from "@/server/handlers/api/auth/password-reset/confirm/route";
import * as route104 from "@/server/handlers/api/auth/password-reset/request/route";
import * as route105 from "@/server/handlers/api/backups/[id]/download/route";
import * as route106 from "@/server/handlers/api/calendar/events/[eventId]/route";
import * as route107 from "@/server/handlers/api/domains/[id]/dns/route";
import * as route108 from "@/server/handlers/api/domains/[id]/receiving/route";
import * as route109 from "@/server/handlers/api/domains/[id]/resend/route";
import * as route110 from "@/server/handlers/api/domains/[id]/sending/route";
import * as route111 from "@/server/handlers/api/domains/[id]/ses/route";
import * as route112 from "@/server/handlers/api/drafts/[id]/attachments/route";
import * as route113 from "@/server/handlers/api/import/imap/folders/route";
import * as route114 from "@/server/handlers/api/mailboxes/[id]/access/route";
import * as route115 from "@/server/handlers/api/mailboxes/[id]/aliases/route";
import * as route116 from "@/server/handlers/api/mailboxes/[id]/avatar/route";
import * as route117 from "@/server/handlers/api/messages/[messageId]/metadata/route";
import * as route118 from "@/server/handlers/api/messages/[messageId]/original/route";
import * as route119 from "@/server/handlers/api/messages/[messageId]/read/route";
import * as route120 from "@/server/handlers/api/messages/[messageId]/snooze/route";
import * as route121 from "@/server/handlers/api/messages/[messageId]/star/route";
import * as route122 from "@/server/handlers/api/messages/[messageId]/status/route";
import * as route123 from "@/server/handlers/api/messages/[messageId]/thread/route";
import * as route124 from "@/server/handlers/api/public/booking/[eventId]/route";
import * as route125 from "@/server/handlers/api/routing-rules/domain/[id]/route";
import * as route126 from "@/server/handlers/api/settings/mfa/confirm/route";
import * as route127 from "@/server/handlers/api/settings/mfa/disable/route";
import * as route128 from "@/server/handlers/api/settings/mfa/enroll/route";
import * as route129 from "@/server/handlers/api/settings/mfa/recovery-codes/route";
import * as route130 from "@/server/handlers/api/setup/domain/mx/route";
import * as route131 from "@/server/handlers/api/v1/accounts/[id]/route";
import * as route132 from "@/server/handlers/api/v1/domains/[id]/route";
import * as route133 from "@/server/handlers/api/v1/mailboxes/[id]/route";
import * as route134 from "@/server/handlers/api/webhooks/[id]/deliveries/route";
import * as route135 from "@/server/handlers/api/webhooks/[id]/test/route";
import * as route136 from "@/server/handlers/api/agent/approvals/[id]/confirm/route";
import * as route137 from "@/server/handlers/api/agent/jobs/[id]/retry/route";
import * as route138 from "@/server/handlers/api/auth/accounts/[userId]/avatar/route";
import * as route139 from "@/server/handlers/api/domains/[id]/dns/setup/route";
import * as route140 from "@/server/handlers/api/domains/[id]/receiving/[provider]/route";
import * as route141 from "@/server/handlers/api/drafts/[id]/attachments/[attachmentId]/route";
import * as route142 from "@/server/handlers/api/messages/[messageId]/attachments/[attachmentId]/route";
import * as route143 from "@/server/handlers/api/v1/domains/[id]/dns/route";
import * as route144 from "@/server/handlers/api/v1/domains/[id]/dns/setup/route";
import * as route145 from "@/server/handlers/api/webhooks/[id]/deliveries/[deliveryId]/retry/route";
import * as route146 from "@/server/handlers/jmap/[[...segments]]/route";

import * as jmapDiscovery from "./handlers/.well-known/jmap/route";

export const api = new Hono<ApiEnv>()
	.get("/.well-known/jmap", adaptHandler(jmapDiscovery.GET))
	.post("/mcp", adaptHandler(route0.POST))
	.get("/mcp", adaptHandler(route0.GET))
	.delete("/mcp", adaptHandler(route0.DELETE))
	.get("/api/accounts", adaptHandler(route1.GET))
	.post("/api/accounts", adaptHandler(route1.POST))
	.get("/api/activity", adaptHandler(route2.GET))
	.get("/api/api-keys", adaptHandler(route3.GET))
	.post("/api/api-keys", adaptHandler(route3.POST))
	.delete("/api/api-keys", adaptHandler(route3.DELETE))
	.get("/api/attachment-policy", adaptHandler(route4.GET))
	.get("/api/audit-logs", adaptHandler(route5.GET))
	.get("/api/backups", adaptHandler(route6.GET))
	.put("/api/backups", adaptHandler(route6.PUT))
	.post("/api/backups", adaptHandler(route6.POST))
	.get("/api/booking", adaptHandler(route7.GET))
	.post("/api/booking", adaptHandler(route7.POST))
	.get("/api/branding", adaptHandler(route8.GET))
	.put("/api/branding", adaptHandler(route8.PUT))
	.get("/api/contacts", adaptHandler(route9.GET))
	.patch("/api/contacts", adaptHandler(route9.PATCH))
	.get("/api/domains", adaptHandler(route10.GET))
	.post("/api/domains", adaptHandler(route10.POST))
	.get("/api/drafts", adaptHandler(route11.GET))
	.post("/api/drafts", adaptHandler(route11.POST))
	.get("/api/folders", adaptHandler(route12.GET))
	.post("/api/folders", adaptHandler(route12.POST))
	.post("/api/inbound", adaptHandler(route13.POST))
	.get("/api/licenses", adaptHandler(route14.GET))
	.get("/api/mailboxes", adaptHandler(route15.GET))
	.post("/api/mailboxes", adaptHandler(route15.POST))
	.get("/api/messages", adaptHandler(route16.GET))
	.get("/api/routing-rules", adaptHandler(route17.GET))
	.post("/api/routing-rules", adaptHandler(route17.POST))
	.post("/api/seed", adaptHandler(route18.POST))
	.post("/api/send", adaptHandler(route19.POST))
	.get("/api/templates", adaptHandler(route20.GET))
	.post("/api/templates", adaptHandler(route20.POST))
	.get("/api/webhooks", adaptHandler(route21.GET))
	.post("/api/webhooks", adaptHandler(route21.POST))
	.get("/api/accounts/:id", adaptHandler(route22.GET))
	.patch("/api/accounts/:id", adaptHandler(route22.PATCH))
	.get("/api/admin/agent", adaptHandler(route23.GET))
	.put("/api/admin/agent", adaptHandler(route23.PUT))
	.get("/api/admin/ai-usage", adaptHandler(route24.GET))
	.get("/api/admin/api-keys", adaptHandler(route25.GET))
	.post("/api/admin/api-keys", adaptHandler(route25.POST))
	.delete("/api/admin/api-keys", adaptHandler(route25.DELETE))
	.get("/api/admin/aws", adaptHandler(route26.GET))
	.put("/api/admin/aws", adaptHandler(route26.PUT))
	.post("/api/admin/aws", adaptHandler(route26.POST))
	.delete("/api/admin/aws", adaptHandler(route26.DELETE))
	.get("/api/admin/general", adaptHandler(route27.GET))
	.put("/api/admin/general", adaptHandler(route27.PUT))
	.get("/api/admin/migrations", adaptHandler(route28.GET))
	.post("/api/admin/migrations", adaptHandler(route28.POST))
	.get("/api/admin/resend-key", adaptHandler(route29.GET))
	.put("/api/admin/resend-key", adaptHandler(route29.PUT))
	.delete("/api/admin/resend-key", adaptHandler(route29.DELETE))
	.get("/api/admin/search-index", adaptHandler(route30.GET))
	.post("/api/admin/search-index", adaptHandler(route30.POST))
	.get("/api/admin/update", adaptHandler(route31.GET))
	.post("/api/admin/update", adaptHandler(route31.POST))
	.post("/api/agent/approvals", adaptHandler(route32.POST))
	.get("/api/agent/availability", adaptHandler(route33.GET))
	.post("/api/agent/chat", adaptHandler(route34.POST))
	.get("/api/agent/conversations", adaptHandler(route35.GET))
	.get("/api/agent/jobs", adaptHandler(route36.GET))
	.get("/api/agent/mcp-keys", adaptHandler(route37.GET))
	.post("/api/agent/mcp-keys", adaptHandler(route37.POST))
	.delete("/api/agent/mcp-keys", adaptHandler(route37.DELETE))
	.get("/api/agent/settings", adaptHandler(route38.GET))
	.put("/api/agent/settings", adaptHandler(route38.PUT))
	.get("/api/auth/accounts", adaptHandler(route39.GET))
	.post("/api/auth/login", adaptHandler(route40.POST))
	.post("/api/auth/logout", adaptHandler(route41.POST))
	.get("/api/auth/me", adaptHandler(route42.GET))
	.post("/api/auth/register", adaptHandler(route43.POST))
	.post("/api/auth/switch", adaptHandler(route44.POST))
	.delete("/api/backups/:id", adaptHandler(route45.DELETE))
	.post("/api/backups/restore", adaptHandler(route46.POST))
	.patch("/api/booking/settings", adaptHandler(route48.PATCH))
	.patch("/api/booking/:eventId", adaptHandler(route47.PATCH))
	.delete("/api/booking/:eventId", adaptHandler(route47.DELETE))
	.get("/api/branding/icon", adaptHandler(route49.GET))
	.get("/api/calendar/events", adaptHandler(route50.GET))
	.post("/api/calendar/events", adaptHandler(route50.POST))
	.get("/api/contacts/avatar", adaptHandler(route51.GET))
	.post("/api/contacts/avatar", adaptHandler(route51.POST))
	.delete("/api/contacts/avatar", adaptHandler(route51.DELETE))
	.post("/api/contacts/block", adaptHandler(route52.POST))
	.get("/api/domains/:id", adaptHandler(route53.GET))
	.delete("/api/domains/:id", adaptHandler(route53.DELETE))
	.post("/api/domains/check", adaptHandler(route54.POST))
	.get("/api/drafts/:id", adaptHandler(route55.GET))
	.patch("/api/drafts/:id", adaptHandler(route55.PATCH))
	.delete("/api/drafts/:id", adaptHandler(route55.DELETE))
	.get("/api/export/messages", adaptHandler(route56.GET))
	.post("/api/import/imap", adaptHandler(route57.POST))
	.post("/api/import/messages", adaptHandler(route58.POST))
	.post("/api/inbound/resend", adaptHandler(route59.POST))
	.post("/api/inbound/ses", adaptHandler(route60.POST))
	.post("/api/licenses/activate", adaptHandler(route61.POST))
	.post("/api/licenses/deactivate", adaptHandler(route62.POST))
	.post("/api/licenses/validate", adaptHandler(route63.POST))
	.get("/api/mailboxes/:id", adaptHandler(route64.GET))
	.patch("/api/mailboxes/:id", adaptHandler(route64.PATCH))
	.delete("/api/mailboxes/:id", adaptHandler(route64.DELETE))
	.get("/api/messages/counts", adaptHandler(route67.GET))
	.get("/api/messages/navigation", adaptHandler(route69.GET))
	.get("/api/messages/:messageId", adaptHandler(route65.GET))
	.post("/api/messages/bulk", adaptHandler(route66.POST))
	.post("/api/messages/empty", adaptHandler(route68.POST))
	.get("/api/profile/avatar", adaptHandler(route70.GET))
	.post("/api/profile/avatar", adaptHandler(route70.POST))
	.delete("/api/profile/avatar", adaptHandler(route70.DELETE))
	.get("/api/public/booking", adaptHandler(route71.GET))
	.patch("/api/routing-rules/:id", adaptHandler(route72.PATCH))
	.delete("/api/routing-rules/:id", adaptHandler(route72.DELETE))
	.get("/api/routing-rules/domain", adaptHandler(route73.GET))
	.post("/api/routing-rules/domain", adaptHandler(route73.POST))
	.patch("/api/settings/forwarding", adaptHandler(route74.PATCH))
	.get("/api/settings/mfa", adaptHandler(route75.GET))
	.patch("/api/settings/password", adaptHandler(route76.PATCH))
	.patch("/api/settings/profile", adaptHandler(route77.PATCH))
	.get("/api/settings/recipient-addresses", adaptHandler(route78.GET))
	.patch("/api/settings/recipient-addresses", adaptHandler(route78.PATCH))
	.get("/api/settings/shortcuts", adaptHandler(route79.GET))
	.patch("/api/settings/shortcuts", adaptHandler(route79.PATCH))
	.get("/api/settings/spam", adaptHandler(route80.GET))
	.patch("/api/settings/spam", adaptHandler(route80.PATCH))
	.patch("/api/settings/time-zone", adaptHandler(route81.PATCH))
	.get("/api/settings/trash-retention", adaptHandler(route82.GET))
	.patch("/api/settings/trash-retention", adaptHandler(route82.PATCH))
	.post("/api/setup/domain", adaptHandler(route83.POST))
	.post("/api/setup/prepare", adaptHandler(route84.POST))
	.get("/api/setup/status", adaptHandler(route85.GET))
	.get("/api/shared-files/:id", adaptHandler(route86.GET))
	.delete("/api/templates/:id", adaptHandler(route87.DELETE))
	.get("/api/v1/accounts", adaptHandler(route88.GET))
	.post("/api/v1/accounts", adaptHandler(route88.POST))
	.get("/api/v1/domains", adaptHandler(route89.GET))
	.post("/api/v1/domains", adaptHandler(route89.POST))
	.get("/api/v1/mailboxes", adaptHandler(route90.GET))
	.post("/api/v1/mailboxes", adaptHandler(route90.POST))
	.get("/api/v1/messages", adaptHandler(route91.GET))
	.post("/api/v1/send", adaptHandler(route92.POST))
	.get("/api/webhooks/:id", adaptHandler(route93.GET))
	.patch("/api/webhooks/:id", adaptHandler(route93.PATCH))
	.delete("/api/webhooks/:id", adaptHandler(route93.DELETE))
	.get("/api/accounts/:id/avatar", adaptHandler(route94.GET))
	.post("/api/accounts/:id/avatar", adaptHandler(route94.POST))
	.get("/api/accounts/:id/mailbox-access", adaptHandler(route95.GET))
	.post("/api/accounts/:id/mailbox-access", adaptHandler(route95.POST))
	.delete("/api/accounts/:id/mailbox-access", adaptHandler(route95.DELETE))
	.get("/api/accounts/:id/mailboxes", adaptHandler(route96.GET))
	.post("/api/accounts/:id/transfer-primary", adaptHandler(route97.POST))
	.post("/api/admin/agent/models", adaptHandler(route98.POST))
	.post("/api/agent/actions/confirm", adaptHandler(route99.POST))
	.get("/api/agent/approvals/:id", adaptHandler(route100.GET))
	.get("/api/agent/conversations/:id", adaptHandler(route101.GET))
	.delete("/api/agent/conversations/:id", adaptHandler(route101.DELETE))
	.post("/api/auth/mfa/verify", adaptHandler(route102.POST))
	.post("/api/auth/password-reset/confirm", adaptHandler(route103.POST))
	.post("/api/auth/password-reset/request", adaptHandler(route104.POST))
	.get("/api/backups/:id/download", adaptHandler(route105.GET))
	.patch("/api/calendar/events/:eventId", adaptHandler(route106.PATCH))
	.delete("/api/calendar/events/:eventId", adaptHandler(route106.DELETE))
	.get("/api/domains/:id/dns", adaptHandler(route107.GET))
	.put("/api/domains/:id/receiving", adaptHandler(route108.PUT))
	.get("/api/domains/:id/receiving", adaptHandler(route108.GET))
	.delete("/api/domains/:id/receiving", adaptHandler(route108.DELETE))
	.get("/api/domains/:id/resend", adaptHandler(route109.GET))
	.post("/api/domains/:id/resend", adaptHandler(route109.POST))
	.put("/api/domains/:id/sending", adaptHandler(route110.PUT))
	.get("/api/domains/:id/sending", adaptHandler(route110.GET))
	.delete("/api/domains/:id/sending", adaptHandler(route110.DELETE))
	.get("/api/domains/:id/ses", adaptHandler(route111.GET))
	.post("/api/domains/:id/ses", adaptHandler(route111.POST))
	.post("/api/drafts/:id/attachments", adaptHandler(route112.POST))
	.post("/api/import/imap/folders", adaptHandler(route113.POST))
	.get("/api/mailboxes/:id/access", adaptHandler(route114.GET))
	.post("/api/mailboxes/:id/access", adaptHandler(route114.POST))
	.delete("/api/mailboxes/:id/access", adaptHandler(route114.DELETE))
	.get("/api/mailboxes/:id/aliases", adaptHandler(route115.GET))
	.post("/api/mailboxes/:id/aliases", adaptHandler(route115.POST))
	.delete("/api/mailboxes/:id/aliases", adaptHandler(route115.DELETE))
	.get("/api/mailboxes/:id/avatar", adaptHandler(route116.GET))
	.post("/api/mailboxes/:id/avatar", adaptHandler(route116.POST))
	.get("/api/messages/:messageId/metadata", adaptHandler(route117.GET))
	.get("/api/messages/:messageId/original", adaptHandler(route118.GET))
	.post("/api/messages/:messageId/read", adaptHandler(route119.POST))
	.post("/api/messages/:messageId/snooze", adaptHandler(route120.POST))
	.delete("/api/messages/:messageId/snooze", adaptHandler(route120.DELETE))
	.post("/api/messages/:messageId/star", adaptHandler(route121.POST))
	.post("/api/messages/:messageId/status", adaptHandler(route122.POST))
	.get("/api/messages/:messageId/thread", adaptHandler(route123.GET))
	.get("/api/public/booking/:eventId", adaptHandler(route124.GET))
	.post("/api/public/booking/:eventId", adaptHandler(route124.POST))
	.patch("/api/routing-rules/domain/:id", adaptHandler(route125.PATCH))
	.delete("/api/routing-rules/domain/:id", adaptHandler(route125.DELETE))
	.post("/api/settings/mfa/confirm", adaptHandler(route126.POST))
	.post("/api/settings/mfa/disable", adaptHandler(route127.POST))
	.post("/api/settings/mfa/enroll", adaptHandler(route128.POST))
	.post("/api/settings/mfa/recovery-codes", adaptHandler(route129.POST))
	.post("/api/setup/domain/mx", adaptHandler(route130.POST))
	.get("/api/v1/accounts/:id", adaptHandler(route131.GET))
	.patch("/api/v1/accounts/:id", adaptHandler(route131.PATCH))
	.get("/api/v1/domains/:id", adaptHandler(route132.GET))
	.delete("/api/v1/domains/:id", adaptHandler(route132.DELETE))
	.get("/api/v1/mailboxes/:id", adaptHandler(route133.GET))
	.patch("/api/v1/mailboxes/:id", adaptHandler(route133.PATCH))
	.delete("/api/v1/mailboxes/:id", adaptHandler(route133.DELETE))
	.get("/api/webhooks/:id/deliveries", adaptHandler(route134.GET))
	.post("/api/webhooks/:id/test", adaptHandler(route135.POST))
	.post("/api/agent/approvals/:id/confirm", adaptHandler(route136.POST))
	.post("/api/agent/jobs/:id/retry", adaptHandler(route137.POST))
	.get("/api/auth/accounts/:userId/avatar", adaptHandler(route138.GET))
	.post("/api/domains/:id/dns/setup", adaptHandler(route139.POST))
	.get("/api/domains/:id/receiving/:provider", adaptHandler(route140.GET))
	.post("/api/domains/:id/receiving/:provider", adaptHandler(route140.POST))
	.delete("/api/drafts/:id/attachments/:attachmentId", adaptHandler(route141.DELETE))
	.get("/api/messages/:messageId/attachments/:attachmentId", adaptHandler(route142.GET))
	.get("/api/v1/domains/:id/dns", adaptHandler(route143.GET))
	.post("/api/v1/domains/:id/dns/setup", adaptHandler(route144.POST))
	.post("/api/webhooks/:id/deliveries/:deliveryId/retry", adaptHandler(route145.POST))
	.get("/jmap/*", adaptHandler(route146.GET))
	.post("/jmap/*", adaptHandler(route146.POST))
	.options("/jmap/*", adaptHandler(route146.OPTIONS))
;

export type AppType = typeof api;
