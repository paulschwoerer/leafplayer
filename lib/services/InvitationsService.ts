import { LeafplayerConfig } from '../config/index.ts';
import { DB } from '../database/index.ts';
import { InvitationRow } from '../database/rows.ts';
import { getCurrentUnixTimestamp } from '../helpers/time.ts';

export enum CreateInvitationResult {
  SUCCESS,
  INVITE_CODE_TOO_SHORT,
}

type Injects = {
  db: DB;
  config: LeafplayerConfig;
};

export interface InvitationsService {
  createInvitation(details: {
    code: string;
    comment?: string;
  }): Error | undefined;
  getAllInvitations(): InvitationRow[];
  deleteInvitation(code: string): Error | undefined;
  isValidInviteCode(inviteCode: string): boolean;
  invalidateInvitation(inviteCode: string): void;
}

export default function createInvitationsService({
  db,
  config: { security: securityConfig },
}: Injects): InvitationsService {
  return {
    createInvitation({ code, comment }) {
      const minLength = securityConfig.minimumInviteCodeLength;

      if (code.length < minLength) {
        return new Error(
          `An invite code needs a length of at least ${minLength} characters`,
        );
      }

      const existing = db
        .prepare<string, InvitationRow>(
          'SELECT id FROM invitations WHERE code = ?',
        )
        .first(code);

      if (existing) {
        return new Error('An invitation already exists with this invite code');
      }

      db.prepare<{ code: string; comment: string | null; expiresAt: number }>(
        'INSERT INTO invitations (code, comment, expiresAt) VALUES (:code, :comment, :expiresAt)',
      ).run({
        code,
        comment: comment || null,
        expiresAt: getCurrentUnixTimestamp() + securityConfig.invitationMaxAge,
      });
    },

    getAllInvitations(): InvitationRow[] {
      return db
        .prepare<unknown[], InvitationRow>('SELECT * FROM invitations;')
        .all();
    },

    deleteInvitation(code: string): Error | undefined {
      const rowsChanged = db
        .prepare<string>('DELETE FROM invitations WHERE code = ?')
        .run(code);

      if (rowsChanged === 0) {
        return new Error('No invitation with the given code found');
      }
    },

    isValidInviteCode(code: string): boolean {
      const invitation = db
        .prepare<{ code: string; expiresAt: number }>(
          'SELECT id FROM invitations WHERE code = :code AND used = FALSE AND expiresAt > :expiresAt',
        )
        .first({
          code,
          expiresAt: getCurrentUnixTimestamp(),
        });

      return !!invitation;
    },

    invalidateInvitation(code: string): void {
      db.prepare(
        'UPDATE invitations SET used = TRUE WHERE code = ? AND used = FALSE',
      ).run(code);
    },
  };
}
