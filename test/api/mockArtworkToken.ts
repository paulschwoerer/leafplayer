import {
  preHandlerAsyncHookHandler,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyPluginAsync,
} from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyArtworkToken: preHandlerAsyncHookHandler<
      RawServerDefault,
      RawRequestDefaultExpression,
      RawReplyDefaultExpression,
      {
        Querystring: {
          token?: string;
        };
      }
    >;
  }
}

export function mockArtworkToken(): FastifyPluginAsync {
  return fp(async function (server) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    server.decorate('verifyArtworkToken', async () => {});
  });
}
