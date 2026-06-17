import { type Command } from 'commander';

export interface CommandLoader {
  (parent: Command): void;
}
