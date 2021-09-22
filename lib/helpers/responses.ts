import { ApiError } from '@common';
import { FastifyReply } from 'fastify';

function sendApiError(reply: FastifyReply, error: ApiError): FastifyReply {
  return reply.status(error.statusCode).send(error);
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

export function sendBadRequestError(
  reply: FastifyReply,
  message: string,
): FastifyReply {
  return sendApiError(reply, {
    statusCode: 400,
    error: 'Bad Request',
    message: message,
  });
}
