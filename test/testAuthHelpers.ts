import { User } from '@/common';
import { Middleware } from '@/middlewares/Middleware';
import { AuthContext } from '@/typings/AuthContext';

type Params = {
  user: User;
  sessionId: string;
  userPassword: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext;
  }
}

export function mockAuthMiddleware({
  user,
  sessionId,
  userPassword,
}: Params): Middleware {
  return async function (request) {
    request.auth = {
      getUser() {
        return user;
      },
      getUserId() {
        return user.id;
      },
      getSessionId() {
        return sessionId;
      },
      isValidPassword(password: string) {
        return userPassword === password;
      },
    };
  };
}
