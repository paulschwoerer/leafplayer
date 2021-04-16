import { Middleware } from './Middleware';

type Injects = {
  isValidJwtToken(token: string): boolean;
};

export function createTokenAuthMiddleware({
  isValidJwtToken,
}: Injects): Middleware<{ Querystring: { token?: string } }> {
  return async function (request, reply) {
    const token = request.query.token;

    if (!token || !token.length) {
      return reply.status(400).send('a token is required');
    }

    if (!isValidJwtToken(token)) {
      return reply.status(401).send();
    }
  };
}
