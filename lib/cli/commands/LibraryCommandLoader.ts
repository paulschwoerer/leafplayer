import { printError, printInfo, printSuccess } from '../../helpers/cli.ts';
import { MusicCleaner } from '../../scanner/MusicCleaner.ts';
import MusicScanner from '../../scanner/MusicScanner.ts';
import { type AlbumsService } from '../../services/AlbumsService.ts';
import { type ArtistsService } from '../../services/ArtistsService.ts';
import { type AudioFilesService } from '../../services/AudioFilesService.ts';
import { type LibraryService } from '../../services/LibraryService.ts';
import { type DB } from '../../database/index.ts';
import { type CommandLoader } from '../CommandLoader.ts';

type Config = {
  storageDir: string;
};

type Injects = {
  config: Config;
  db: DB;
  audioFilesService: AudioFilesService;
  albumsService: AlbumsService;
  artistsService: ArtistsService;
  libraryService: LibraryService;
};

export function createLibraryCommandLoader({
  config,
  db,
  audioFilesService,
  albumsService,
  artistsService,
  libraryService,
}: Injects): CommandLoader {
  return cli => {
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
          const result = libraryService.removeMediaDirectory(remove);

          if (result instanceof Error) {
            printError(result.message);
          }
        } else {
          const directories = libraryService.getAllMediaDirectories();

          console.table(directories);
        }
      });
  };
}
