import { createCommand } from 'commander';

import { CommandLoader } from './CommandLoader';

export interface CLI {
  add(loader: CommandLoader): CLI;
  parse(): Promise<void>;
}

type Injects = {
  version: string;
};

export function createCLI({ version }: Injects): CLI {
  const program = createCommand();

  program.version(version);

  return {
    add(loader) {
      loader(program);

      return this;
    },

    async parse() {
      await program.parseAsync(process.argv);
    },
  };
}
