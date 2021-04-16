export function createNamespacedWhereParams(
  namespace: string,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const namespacedParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    namespacedParams[`${namespace}.${key}`] = value;
  }
  return namespacedParams;
}
