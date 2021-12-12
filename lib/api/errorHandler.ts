import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { NotFoundError } from '@/errors/NotFoundError';
import { ValidationError } from '@/errors/ValidationError';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (error instanceof ValidationError) {
    error.statusCode = 400;
  } else if (error instanceof NotFoundError) {
    error.statusCode = 404;
  } else if (error instanceof NotAuthorizedError) {
    error.statusCode = 401;
  } else {
    error.statusCode = reply.statusCode;
  }

  if (error.statusCode < 500) {
    reply.log.info({ res: reply, err: error }, error.message);
  } else {
    reply.log.error({ req: request, res: reply, err: error }, error.message);
  }

  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    error.message =
      'An internal server error occurred. See the server logs for details.';
  }

  return reply.send(error);
}
