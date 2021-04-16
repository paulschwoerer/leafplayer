export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
