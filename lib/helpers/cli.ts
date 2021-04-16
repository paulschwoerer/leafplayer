import chalk from 'chalk';

export function printInfo(message: string): void {
  console.log('');
  console.log(chalk.grey(message));
}

export function printSuccess(message: string): void {
  console.log('');
  console.log(chalk.green(`✓ ${message}`));
}

export function printError(message: string): void {
  console.log('');
  console.error(chalk.bold.red(`Error: ${message}`));
}
