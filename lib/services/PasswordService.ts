import { Knex } from 'knex';

import { createPasswordHash } from '@/helpers/passwords';
import { ValidationError } from '@/errors/ValidationError';

import { LeafplayerConfig } from '../config/index';
export interface PasswordService {
  validatePasswordSecurity(password: string): Error | void;
  setUserPasswordAndRevokeSessions(
    userId: string,
    newPassword: string,
    options?: {
      excludedSessionId?: string;
    },
  ): Promise<void>;
}

type Injects = {
  db: Knex;
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

    async setUserPasswordAndRevokeSessions(userId, newPassword, options) {
      const pwResult = this.validatePasswordSecurity(newPassword);
      if (pwResult instanceof Error) {
        throw pwResult;
      }

      await db.transaction(async trx => {
        await trx('users')
          .update({
            password: createPasswordHash(newPassword),
          })
          .where({
            id: userId,
          });

        let sessionsQuery = trx('sessions').delete().where({
          userId,
        });

        if (options?.excludedSessionId) {
          sessionsQuery = sessionsQuery.whereNot({
            id: options.excludedSessionId,
          });
        }

        await sessionsQuery;
      });
    },
  };
}
