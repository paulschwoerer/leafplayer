import { createPasswordHash } from '../helpers/passwords.ts';
import { ValidationError } from '../errors/ValidationError.ts';
import { type DB } from '../database/index.ts';
import { type LeafplayerConfig } from '../config/index.ts';

export interface PasswordService {
  validatePasswordSecurity(password: string): Error | void;
  setUserPasswordAndRevokeSessions(
    userId: string,
    newPassword: string,
    activeSessionId: string,
  ): void;
}

type Injects = {
  db: DB;
  config: LeafplayerConfig;
};

export default function createPasswordService({
  db,
  config,
}: Injects): PasswordService {
  return {
    validatePasswordSecurity(password) {
      if (password.length < config.security.minimumPasswordLength) {
        return new ValidationError(
          `Password needs at least ${config.security.minimumPasswordLength} characters`,
        );
      }
    },

    setUserPasswordAndRevokeSessions(userId, newPassword, activeSessionId) {
      const pwResult = this.validatePasswordSecurity(newPassword);
      if (pwResult instanceof Error) {
        throw pwResult;
      }

      const driver = db.driver();

      const userUpdate = driver.prepare(
        'UPDATE users SET password = :password WHERE id = :userId',
      );
      const sessionDelete = driver.prepare(
        'DELETE FROM sessions WHERE userId = :userId AND id != :activeSessionId',
      );

      driver.transaction(() => {
        userUpdate.run({
          userId,
          password: createPasswordHash(newPassword),
        });

        sessionDelete.run({
          userId,
          activeSessionId,
        });
      })();
    },
  };
}
