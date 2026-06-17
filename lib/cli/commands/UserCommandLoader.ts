import { printError, printSuccess } from '../../helpers/cli.ts';
import { type UsersService } from '../../services/UsersService.ts';
import { type CommandLoader } from '../CommandLoader.ts';

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
        ({
          username,
          password,
          displayName,
        }: {
          username: string;
          password: string;
          displayName?: string;
        }) => {
          const userExists = usersService.exists(username);

          if (userExists) {
            return printError('user already exists');
          }

          usersService.create({
            username,
            displayName: displayName || username,
            password,
          });

          printSuccess(`user ${displayName || username} added`);
        },
      );

    cli.command('users:list').action(() => {
      const users = usersService.findAll();

      console.table(
        users.map(({ username, displayName }) => ({ username, displayName })),
      );
    });
  };
}
