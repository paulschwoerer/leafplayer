import { UserSession } from '@/common';

import { SessionRow } from '../database/rows.ts';

export function toUserSession({
  id,
  userId,
  lastUsedAt,
  browser,
  os,
}: SessionRow): UserSession {
  return {
    id,
    userId,
    lastUsedAt,
    browser,
    os,
  };
}
