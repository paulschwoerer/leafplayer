export type ApiError = {
  statusCode: number;
  error: string;
  message: string;
  code?: string;
  stack?: string;
};
