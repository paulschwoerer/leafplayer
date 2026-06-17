import {
  type preHandlerHookHandler,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
} from 'fastify';

import { NotAuthorizedError } from '../errors/NotAuthorizedError.ts';
import { ValidationError } from '../errors/ValidationError.ts';
import { type JwtService } from '../services/JwtService.ts';

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
