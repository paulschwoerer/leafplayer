export enum ApiErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_INVITE_CODE = 'INVALID_INVITE_CODE',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  INSECURE_PASSWORD = 'INSECURE_PASSWORD',
  INVALID_SESSION = 'INVALID_SESSION',
}

export type ApiError = {
  statusCode: number;
  code: string;
  error: string;
  message?: string;
  stack?: string;
};
