import { sendBadRequestError } from '@/helpers/responses';

import { Middleware } from './Middleware';

type Injects = {
  isValidJwtToken(token: string): boolean;
};

type TokenParams = { Querystring: { token?: string } };

export function createTokenAuthMiddleware({
  isValidJwtToken,
}: Injects): Middleware<TokenParams> {
  return async function (request, reply) {
    const token = request.query.token;

    if (!token || !token.length) {
      return sendBadRequestError(reply, 'a token is required');
    }

    if (!isValidJwtToken(token)) {
      return reply.status(401).send();
    }
  };
}
