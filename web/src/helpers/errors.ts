export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'unknown error';
}
