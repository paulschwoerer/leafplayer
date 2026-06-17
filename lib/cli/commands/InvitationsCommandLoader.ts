import { printError, printInfo, printSuccess } from '../../helpers/cli.ts';
import { type InvitationsService } from '../../services/InvitationsService.ts';
import { type CommandLoader } from '../CommandLoader.ts';

type Injects = {
  invitationsService: InvitationsService;
};

export function createInvitationsCommandLoader({
  invitationsService,
}: Injects): CommandLoader {
  return cli => {
    cli
      .command('invitations:list')
      .description('list all invitations')
      .action(() => {
        const invitations = invitationsService.getAllInvitations();

        if (invitations.length === 0) {
          return printInfo('No invitations to show');
        }

        console.table(
          invitations.map(({ code, used, comment }) => ({
            code,
            used: used ? 'Yes' : 'No',
            comment,
          })),
        );
      });

    cli
      .command('invitations:create')
      .description('create an invitation')
      .requiredOption('-c, --code <code>', 'specify an invitation code')
      .option('--comment <comment>', 'specify a comment')
      .action(({ code, comment }: { code: string; comment?: string }) => {
        const result = invitationsService.createInvitation({
          code,
          comment: comment || 'Inserted from CLI',
        });

        if (result instanceof Error) {
          printError(result.message);
        } else {
          printSuccess('Invitation added');
        }
      });

    cli
      .command('invitations:revoke <code>')
      .description('revoke an invitation')
      .action((code: string) => {
        const result = invitationsService.deleteInvitation(code);

        if (result instanceof Error) {
          printError(result.message);
        } else {
          printSuccess('Invitation revoked');
        }
      });
  };
}
