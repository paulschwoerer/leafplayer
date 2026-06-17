import { type UserSession } from 'leafplayer-common';

import { type SessionRow } from '../database/rows.ts';

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
