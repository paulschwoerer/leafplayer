import { User } from '@/common';
import { LeafplayerConfig } from '@/config';
import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { comparePasswords } from '@/helpers/passwords';
import { getCurrentUnixTimestamp } from '@/helpers/time';

import { PasswordService } from './PasswordService';
import { SessionsService } from './SessionsService';
import { UsersService } from './UsersService';

type Credentials = {
  username: string;
  password: string;
};

type ChangePasswordParams = {
  userId: string;
  activeSessionId: string;
  newPassword: string;
};

type Browser = {
  name: string;
  os: string;
};

type SessionWithUser = {
  id: string;
  user: User;
};

type Injects = {
  config: LeafplayerConfig;
  usersService: UsersService;
  sessionsService: SessionsService;
  passwordService: PasswordService;
};

export interface AuthService {
  login(
    credentials: Credentials,
    browser: Browser,
  ): Promise<{ user: User; sessionToken: string }>;
  authenticate(sessionToken: string): Promise<SessionWithUser>;
  changePassword(params: ChangePasswordParams): Promise<void>;
  logout(sessionId: string): Promise<void>;
}

export default function createAuthService({
  config,
  usersService,
  sessionsService,
  passwordService,
}: Injects): AuthService {
  return {
    async login({ username, password }, browser) {
      const user = await usersService.findWithPasswordByUsername(username);

      if (!user || !comparePasswords(password, user.password)) {
        throw new NotAuthorizedError('Invalid credentials');
      }

      const sessionToken = await sessionsService.create({
        userId: user.id,
        browser,
        maxAge: config.security.sessionMaxAge,
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

    async authenticate(token) {
      const session = await sessionsService.get({
        token,
      });

      if (!session) {
        throw new NotAuthorizedError('Invalid or expired session');
      }

      const user = await usersService.getById(session.userId);

      if (!user) {
        console.log('found session without user when authenticating');
        throw new NotAuthorizedError('Invalid or expired session');
      }

      await sessionsService.update(session.id, {
        lastUsedAt: getCurrentUnixTimestamp(),
      });

      return {
        id: session.id,
        user,
      };
    },

    async changePassword({ userId, activeSessionId, newPassword }) {
      await passwordService.setUserPasswordAndRevokeSessions(
        userId,
        newPassword,
        {
          excludedSessionId: activeSessionId,
        },
      );
    },

    async logout(sessionId) {
      await sessionsService.deleteById(sessionId);
    },
  };
}
