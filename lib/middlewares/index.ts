import { createAuthMiddleware } from './AuthMiddleware';
import { createTokenAuthMiddleware } from './TokenAuthMiddleware';

export {
  createAuthMiddleware as AuthMiddleware,
  createTokenAuthMiddleware as TokenAuthMiddleware,
};
