export function withTimestamps(...fields: string[]): string[] {
  return ['createdAt', 'updatedAt', ...fields];
}
