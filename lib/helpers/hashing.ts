import { createHash } from 'crypto';

export function computeSha256(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}
