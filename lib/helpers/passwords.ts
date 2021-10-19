import bcrypt from 'bcrypt';

import { computeSha256 } from './hashing';

const BCRYPT_WORKLOAD = 12;

export function comparePasswords(
  password: string,
  encryptedPassword: string,
): boolean {
  const sha256 = computeSha256(password);
  return bcrypt.compareSync(sha256, encryptedPassword);
}

export function createPasswordHash(password: string): string {
  const sha256 = computeSha256(password);
  return bcrypt.hashSync(sha256, BCRYPT_WORKLOAD);
}
