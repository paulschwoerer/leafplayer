import { randomUUID } from 'crypto';

const UUID_V4_REGEX =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export function generateUuid(): string {
  return randomUUID();
}

export function isUuidV4(maybeUuidV4: string): boolean {
  return UUID_V4_REGEX.test(maybeUuidV4);
}
