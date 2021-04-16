import commander from 'commander';
import { InvitationsService } from '../services/InvitationsService';
import { printInfo, printError, printSuccess } from '../helpers/cli';

type Injects = {
  invitationsService: InvitationsService;
};

export function InvitationsCommands(
  cli: commander.Command,
  { invitationsService }: Injects,
): void {
  cli
    .command('invitations:list')
    .description('list all invitations')
    .action(async () => {
      const invitations = await invitationsService.getAllInvitations();

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
    .option('-c, --code <code>', 'specify an invitation code')
    .option('--comment <comment>', 'specify a comment')
    .requiredOption('code')
    .action(async ({ code, comment }: { code: string; comment?: string }) => {
      const result = await invitationsService.createInvitation({
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
    .action(async (code: string) => {
      const result = await invitationsService.deleteInvitation(code);

      if (result instanceof Error) {
        printError(result.message);
      } else {
        printSuccess('Invitation revoked');
      }
    });
}
