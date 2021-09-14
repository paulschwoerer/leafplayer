import { FastifyReply } from 'fastify';
import { ApiError } from '@common';

function sendApiError(
  reply: FastifyReply,
  { statusCode, code, error }: ApiError,
  headers: Record<string, string> = {},
): FastifyReply {
  return reply
    .headers(headers)
    .status(statusCode)
    .send({ statusCode, code, error });
}

export function sendNotFoundError(
  reply: FastifyReply,
  message?: string,
): FastifyReply {
  return sendApiError(reply, {
    statusCode: 404,
    error: 'Not Found',
    message: message || 'The requested resource was not found',
  });
}

export function sendNotAuthorizedError(
  reply: FastifyReply,
  message?: string,
): FastifyReply {
  return sendApiError(reply, {
    statusCode: 401,
    error: 'Not Authorized',
    message: message || 'Not authorized to perform this action',
  });
}
