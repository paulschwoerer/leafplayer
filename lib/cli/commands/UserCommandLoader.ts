import { printError, printSuccess } from '~/helpers/cli';
import { UsersService } from '~/services/UsersService';

import { CommandLoader } from './../CommandLoader';

type Injects = {
  usersService: UsersService;
};

export function createUsersCommandLoader({
  usersService,
}: Injects): CommandLoader {
  return cli => {
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
          const userExists = await usersService.exists(username);

          if (userExists) {
            return printError('user already exists');
          }

          await usersService.create({
            username,
            displayName: displayName || username,
            password,
          });

          printSuccess(`user ${displayName || username} added`);
        },
      );

    cli.command('users:list').action(async () => {
      const users = await usersService.findAll();

      console.table(
        users.map(({ username, displayName }) => ({ username, displayName })),
      );
    });
  };
}
