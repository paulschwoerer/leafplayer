import commander from 'commander';
import { UsersService } from '@/services/UsersService';
import { printError, printSuccess } from '@/helpers/cli';

type Injects = {
  usersService: UsersService;
};

export function UsersCommands(
  cli: commander.Command,
  { usersService }: Injects,
): void {
  cli
    .command('users:add')
    .requiredOption('-u, --username <username>')
    .requiredOption('-p, --password <password>')
    .option('--display-name <display name>')
    .action(
      async ({
        username,
        password,
        displayName,
      }: {
        username: string;
        password: string;
        displayName?: string;
      }) => {
        const userExists = await usersService.doesUserExist(username);

        if (userExists) {
          return printError('user already exists');
        }

        await usersService.createUser({
          username,
          displayName: displayName || username,
          password,
        });

        printSuccess(`user ${displayName || username} added`);
      },
    );

  cli.command('users:list').action(async () => {
    const users = await usersService.getAllUsers();

    console.table(
      users.map(({ username, displayName }) => ({ username, displayName })),
    );
  });
}
