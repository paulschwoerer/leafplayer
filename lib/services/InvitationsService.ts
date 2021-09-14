import Knex from 'knex';
import { LeafplayerConfig } from 'lib/config';
import { InvitationRow } from '../database/rows';
import { getCurrentUnixTimestamp } from '../helpers/time';
import { UsersService } from './UsersService';

export enum CreateInvitationResult {
  SUCCESS,
  INVITE_CODE_TOO_SHORT,
}

type Injects = {
  db: Knex;
  config: LeafplayerConfig;
  usersService: UsersService;
};

export interface InvitationsService {
  createUserUsingInviteCode(
    code: string,
    userDetails: { username: string; displayName?: string; password: string },
  ): Promise<Error | undefined>;
  createInvitation(details: {
    code: string;
    comment?: string;
  }): Promise<Error | undefined>;
  getAllInvitations(): Promise<InvitationRow[]>;
  deleteInvitation(code: string): Promise<Error | undefined>;
  getMinimumInviteCodeLength(): number;
}

export function createInvitationsService({
  db,
  config: { security: securityConfig },
  usersService,
}: Injects): InvitationsService {
  async function isValidInviteCode(code: string): Promise<boolean> {
    const invitation = await db('invitations')
      .where({ code, used: false })
      .andWhere('expiresAt', '>', getCurrentUnixTimestamp())
      .select('id')
      .first();

    return !!invitation;
  }

  async function invalidateInvitation(code: string): Promise<void> {
    await db('invitations').update({ used: true }).where({ code, used: false });
  }

  return {
    async createUserUsingInviteCode(code, userDetails) {
      const isValid = await isValidInviteCode(code);

      if (!isValid) {
        return Error('Invalid invite code');
      }

      const userExists = await usersService.doesUserExist(userDetails.username);

      if (userExists) {
        return Error('Username taken');
      }

      if (userDetails.password.length < securityConfig.minimumPasswordLength) {
        return Error(
          `Password needs at least ${securityConfig.minimumPasswordLength} characters`,
        );
      }

      // TODO: a transaction would be nice
      await usersService.createUser({
        ...userDetails,
        displayName: userDetails.displayName || userDetails.username,
      });
      await invalidateInvitation(code);
    },

    async createInvitation({ code, comment }) {
      const minLength = this.getMinimumInviteCodeLength();

      if (code.length < minLength) {
        return new Error(
          `An invite code needs a length of at least ${minLength} characters`,
        );
      }

      const existing = await db('invitations')
        .select('id')
        .where({ code })
        .first();

      if (existing) {
        return new Error('An invitation already exists with this invite code');
      }

      await db('invitations').insert({
        code,
        comment: comment || null,
        expiresAt: getCurrentUnixTimestamp() + securityConfig.invitationMaxAge,
      });
    },

    getAllInvitations(): Promise<InvitationRow[]> {
      return db('invitations').where(true);
    },

    async deleteInvitation(code: string): Promise<Error | undefined> {
      const rowsChanged = await db('invitations').delete().where({ code });

      if (rowsChanged === 0) {
        return new Error('No invitation with the given code found');
      }
    },

    getMinimumInviteCodeLength() {
      return securityConfig.minimumInviteCodeLength;
    },
  };
}
