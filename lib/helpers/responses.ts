import { FastifyReply } from 'fastify';
import { ApiError, ApiErrorCode } from '@common';

export function sendApiError(
  reply: FastifyReply,
  { statusCode, code, error }: ApiError,
  headers: Record<string, string> = {},
): FastifyReply {
  return reply
    .headers(headers)
    .status(statusCode)
    .send({ statusCode, code, error });
}

export function sendNotFoundApiError(
  reply: FastifyReply,
  message?: string,
): FastifyReply {
  return sendApiError(reply, {
    statusCode: 404,
    code: ApiErrorCode.NOT_FOUND,
    error: 'Resource not found',
    message,
  });
}

export function sendNotAuthorizedError(
  reply: FastifyReply,
  headers?: Record<string, string>,
): FastifyReply {
  return sendApiError(
    reply,
    {
      statusCode: 401,
      code: ApiErrorCode.NOT_AUTHORIZED,
      error: 'not authorized',
    },
    headers,
  );
}
