import {
  preHandlerHookHandler,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from 'fastify';

import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { ValidationError } from '@/errors/ValidationError';
import { JwtService } from '@/services/JwtService';

export type VerifyArtworkTokenPreHandler = preHandlerHookHandler<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Querystring: {
      token?: string;
    };
  }
>;

export function verifyArtworkToken(
  jwtService: JwtService,
): VerifyArtworkTokenPreHandler {
  return (request, _, next) => {
    const token = request.query.token;

    if (!token || !token.length) {
      throw new ValidationError('an artwork token is required');
    }

    if (!jwtService.isValidJwtToken(token)) {
      throw new NotAuthorizedError('artwork token seems to be invalid');
    }

    next();
  };
}
