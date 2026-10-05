import { redirect } from '@tanstack/react-router';
import { apiRequest } from '@/lib/api/request';
import { readApiJson } from '@/lib/api/json';
import { saveUserTimeZonePreference } from '@/lib/time/client';

const primaryOnly = ['/agent', '/api-keys', '/webhooks', '/backups', '/branding', '/licenses', '/activity', '/audit-logs', '/general', '/ai-usage'];

export async function requireProtectedRoute(pathname: string, admin = false, requireMailbox = true) {
 const cookieResponse = await apiRequest('/api/auth/me', { method: 'GET', authenticated: false, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
 const response = cookieResponse.status === 401
  ? await apiRequest('/api/auth/me', { method: 'GET', redirectOnUnauthorized: false, cache: 'no-store', signal: AbortSignal.timeout(10_000) })
  : cookieResponse;
 if (response.status === 401) throw redirect({ to: '/login', replace: true });
 const data = await readApiJson(response);
 saveUserTimeZonePreference(data.user.id, data.user.timeZone);
 if (requireMailbox && !data.hasMailboxes && data.user.role === 'admin' && !data.isSetup) throw redirect({ to: '/setup', replace: true });
 if (admin && data.user.role !== 'admin') throw redirect({ to: '/inbox', replace: true });
 if (admin && !data.user.isPrimaryAdmin && primaryOnly.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) throw redirect({ to: '/admin', replace: true });
}
