import { type User } from 'leafplayer-common';

import { type LeafplayerConfig } from '../config/index.ts';
import { NotAuthorizedError } from '../errors/NotAuthorizedError.ts';
import { comparePasswords } from '../helpers/passwords.ts';
import { getCurrentUnixTimestamp } from '../helpers/time.ts';

import { type PasswordService } from './PasswordService.ts';
import { type SessionsService } from './SessionsService.ts';
import { type UsersService } from './UsersService.ts';

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
  ): { user: User; sessionToken: string };
  authenticate(sessionToken: string): SessionWithUser;
  changePassword(params: ChangePasswordParams): void;
  logout(sessionId: string): void;
}

export default function createAuthService({
  config,
  usersService,
  sessionsService,
  passwordService,
}: Injects): AuthService {
  return {
    login({ username, password }, browser) {
      const user = usersService.findWithPasswordByUsername(username);

      if (!user || !comparePasswords(password, user.password)) {
        throw new NotAuthorizedError('Invalid credentials');
      }

      const sessionToken = sessionsService.create({
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

    authenticate(token) {
      const session = sessionsService.getByToken(token);

      if (!session) {
        throw new NotAuthorizedError('Invalid or expired session');
      }

      const user = usersService.getById(session.userId);

      if (!user) {
        console.log('found session without user when authenticating');
        throw new NotAuthorizedError('Invalid or expired session');
      }

      sessionsService.update(session.id, {
        lastUsedAt: getCurrentUnixTimestamp(),
      });

      return {
        id: session.id,
        user,
      };
    },

    changePassword({ userId, activeSessionId, newPassword }) {
      passwordService.setUserPasswordAndRevokeSessions(
        userId,
        newPassword,
        activeSessionId,
      );
    },

    logout(sessionId) {
      sessionsService.deleteById(sessionId);
    },
  };
}
