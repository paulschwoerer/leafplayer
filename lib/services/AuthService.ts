import jwt from 'jsonwebtoken';
import { User } from '@common';
import { UserRow } from '../database/rows';
import { comparePasswords } from '../helpers/passwords';
import { getCurrentUnixTimestamp } from '../helpers/time';

type Config = {
  sessionMaxAge: number;
  secret: string;
};

type Credentials = {
  username: string;
  password: string;
};

type SessionWithUser = {
  id: string;
  user: UserRow;
};

type Browser = {
  name: string;
  os: string;
};

type SessionCreateParams = {
  userId: string;
  browser: Browser;
  maxAge: number;
};

interface SessionsService {
  create(params: SessionCreateParams): Promise<string>;
  findWithUserByToken(token: string): Promise<SessionWithUser | undefined>;
  deleteById(id: string): Promise<Error | undefined>;
}

type UserWithPassword = User & {
  password: string;
};

interface UsersService {
  findByUsername(username: string): Promise<UserWithPassword | undefined>;
}

type Injects = {
  usersService: UsersService;
  sessionsService: SessionsService;
  config: Config;
};

export interface AuthService {
  authenticate(
    credentials: Credentials,
    browser: Browser,
  ): Promise<{ user: User; sessionToken: string } | Error>;
  logout(sessionId: string): Promise<Error | undefined>;
  makeJwtToken(): string;
  isValidJwtToken(token: string): boolean;
}

export function createAuthService({
  sessionsService,
  usersService,
  config,
}: Injects): AuthService {
  function generateSessionExpireTimestamp(from: number): number {
    return from + config.sessionMaxAge;
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
        maxAge: config.sessionMaxAge,
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

    async logout(sessionId) {
      return sessionsService.deleteById(sessionId);
    },

    makeJwtToken() {
      return jwt.sign(
        {
          exp: generateSessionExpireTimestamp(getCurrentUnixTimestamp()),
        },
        config.secret,
      );
    },

    isValidJwtToken(token) {
      try {
        jwt.verify(token, config.secret);

        return true;
      } catch (e) {
        return false;
      }
    },
  };
}
