import { Knex } from 'knex';
import { LeafplayerConfig } from 'lib/config';

import { InvitationRow } from '@/database/rows';
import { getCurrentUnixTimestamp } from '@/helpers/time';

export enum CreateInvitationResult {
  SUCCESS,
  INVITE_CODE_TOO_SHORT,
}

type Injects = {
  db: Knex;
  config: LeafplayerConfig;
};

export interface InvitationsService {
  createInvitation(details: {
    code: string;
    comment?: string;
  }): Promise<Error | undefined>;
  getAllInvitations(): Promise<InvitationRow[]>;
  deleteInvitation(code: string): Promise<Error | undefined>;
  isValidInviteCode(inviteCode: string): Promise<boolean>;
  invalidateInvitation(inviteCode: string): Promise<void>;
}

export default function createInvitationsService({
  db,
  config: { security: securityConfig },
}: Injects): InvitationsService {
  return {
    async createInvitation({ code, comment }) {
      const minLength = securityConfig.minimumInviteCodeLength;

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

    async isValidInviteCode(code: string): Promise<boolean> {
      const invitation = await db('invitations')
        .where({ code, used: false })
        .andWhere('expiresAt', '>', getCurrentUnixTimestamp())
        .select('id')
        .first();

      return !!invitation;
    },

    async invalidateInvitation(code: string): Promise<void> {
      await db('invitations')
        .update({ used: true })
        .where({ code, used: false });
    },
  };
}
