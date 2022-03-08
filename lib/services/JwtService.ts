import jwt from 'jsonwebtoken';

import { LeafplayerConfig } from '~/config';
import { getCurrentUnixTimestamp } from '~/helpers/time';

type Injects = {
  config: LeafplayerConfig;
};

export interface JwtService {
  makeJwtToken(): string;
  isValidJwtToken(token: string): boolean;
}

export default function createJwtService({
  config: { security: securityConfig },
}: Injects): JwtService {
  function generateExpirationTimestamp(from: number): number {
    return from + securityConfig.sessionMaxAge;
  }

  return {
    makeJwtToken() {
      return jwt.sign(
        {
          exp: generateExpirationTimestamp(getCurrentUnixTimestamp()),
        },
        securityConfig.secret,
      );
    },

    isValidJwtToken(token) {
      try {
        jwt.verify(token, securityConfig.secret);

        return true;
      } catch (e) {
        return false;
      }
    },
  };
}
