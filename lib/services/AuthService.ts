import { User } from '@/common';
import jwt from 'jsonwebtoken';
import Knex from 'knex';
import { LeafplayerConfig } from '@/config';
import { comparePasswords, createPasswordHash } from '@/helpers/passwords';
import { getCurrentUnixTimestamp } from '@/helpers/time';
import { SessionsService } from './SessionsService';
import { UsersService } from './UsersService';

type Credentials = {
  username: string;
  password: string;
};

type Browser = {
  name: string;
  os: string;
};

type Injects = {
  db: Knex;
  config: LeafplayerConfig;
  sessionsService: SessionsService;
  usersService: UsersService;
};

export interface AuthService {
  authenticate(
    credentials: Credentials,
    browser: Browser,
  ): Promise<{ user: User; sessionToken: string } | Error>;
  logout(sessionId: string): Promise<void>;
  changeUserPassword(params: {
    userId: string;
    newPassword: string;
    activeSessionId: string;
  }): Promise<Error | void>;
  makeJwtToken(): string;
  isValidJwtToken(token: string): boolean;
  validatePasswordSecurity(password: string): Error | void;
}

export function createAuthService({
  db,
  config: { security: securityConfig },
  sessionsService,
  usersService,
}: Injects): AuthService {
  function generateSessionExpireTimestamp(from: number): number {
    return from + securityConfig.sessionMaxAge;
  }

  function validatePasswordSecurity(password: string): Error | void {
    if (password.length < securityConfig.minimumPasswordLength) {
      return Error(
        `Password needs at least ${securityConfig.minimumPasswordLength} characters`,
      );
    }
  }

  return {
    async authenticate({ username, password }, browser) {
      const user = await usersService.findByUsername(username);

      if (!user || !comparePasswords(password, user.password)) {
        return Error('Invalid credentials');
      }

      const sessionToken = await sessionsService.create({
        userId: user.id,
        browser,
        maxAge: securityConfig.sessionMaxAge,
      });

      return {
        sessionToken,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
        },
      };
    },

    logout(sessionId) {
      return sessionsService.deleteById(sessionId);
    },

    async changeUserPassword({ userId, newPassword, activeSessionId }) {
      const pwResult = validatePasswordSecurity(newPassword);
      if (pwResult instanceof Error) {
        return pwResult;
      }

      await db.transaction(async trx => {
        await trx('users')
          .update({
            password: createPasswordHash(newPassword),
          })
          .where({
            id: userId,
          });

        await trx('sessions')
          .delete()
          .where({
            userId,
          })
          .whereNot({
            id: activeSessionId,
          });
      });
    },

    makeJwtToken() {
      return jwt.sign(
        {
          exp: generateSessionExpireTimestamp(getCurrentUnixTimestamp()),
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

    validatePasswordSecurity,
  };
}
