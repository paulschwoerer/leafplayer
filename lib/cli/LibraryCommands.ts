import commander from 'commander';
import { Knex } from 'knex';

import { printError, printInfo, printSuccess } from '@/helpers/cli';
import { MusicCleaner } from '@/scanner/MusicCleaner';
import MusicScanner from '@/scanner/MusicScanner';
import { AlbumsService } from '@/services/AlbumsService';
import { ArtistsService } from '@/services/ArtistsService';
import { LibraryService } from '@/services/LibraryService';
import { AudioFilesService } from '@/services/AudioFilesService';

type Config = {
  storageDir: string;
};

type Injects = {
  config: Config;
  db: Knex;
  audioFilesService: AudioFilesService;
  albumsService: AlbumsService;
  artistsService: ArtistsService;
  libraryService: LibraryService;
};

export function LibraryCommands(
  cli: commander.Command,
  {
    config,
    db,
    audioFilesService,
    albumsService,
    artistsService,
    libraryService,
  }: Injects,
): void {
  cli
    .command('library:scan')
    .option(
      '-f, --force-rescan',
      'force rescan of files, even if they did not change since last run',
    )
    .description('run media scanner')
    .action(async ({ forceRescan }: { forceRescan?: boolean }) => {
      printInfo('Running music scanner ...');
      const scanner = new MusicScanner(
        config,
        artistsService,
        albumsService,
        libraryService,
      );

      await scanner.run({
        forceRescan,
      });
      printSuccess('Scan finished');
    });

  cli
    .command('library:wipe')
    .description('wipe entire library')
    .action(async () => {
      await libraryService.wipeLibrary();

      printSuccess('Library wiped');
    });

  cli
    .command('library:clean')
    .description('clean library')
    .action(async () => {
      const cleaner = new MusicCleaner(db, audioFilesService);
      await cleaner.run({
        removeMissing: true,
      });

      printSuccess('Library cleaned');
    });

  cli
    .command('library:dir')
    .description('manage music directories')
    .option('--add <path>')
    .option('--remove <path>')
    .action(async ({ add, remove }: { add?: string; remove?: string }) => {
      if (typeof add === 'string') {
        const result = await libraryService.addMediaDirectory(add);

        if (result instanceof Error) {
          printError(result.message);
        }
      } else if (typeof remove === 'string') {
        const result = await libraryService.removeMediaDirectory(remove);

        if (result instanceof Error) {
          printError(result.message);
        }
      } else {
        const directories = await libraryService.getAllMediaDirectories();

        console.table(directories);
      }
    });
}
