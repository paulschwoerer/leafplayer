export function throwNotImplemented(): void {
  throw new Error('not implemented');
}

export function throwNotImplementedPromise(): Promise<void> {
  return Promise.reject('not implemented');
}
