import { DB } from '@/database';
import { AudioFileRow } from '@/database/rows';
import { printError, printInfo } from '@/helpers/cli';
import { isReadable } from '@/helpers/filesystem';
import { AudioFilesService } from '@/services/AudioFilesService';

type MusicCleanerOptions = {
  removeMissing: boolean;
};

const defaultOptions = {
  removeMissing: false,
};

export class MusicCleaner {
  private options: MusicCleanerOptions = defaultOptions;

  constructor(private db: DB, private audioFilesService: AudioFilesService) {}

  async run(options?: MusicCleanerOptions): Promise<void> {
    this.options = {
      ...this.options,
      ...options,
    };

    const audioFiles = this.audioFilesService.findAll();

    await this.processAudioFiles(audioFiles);
  }

  private async processAudioFiles(files: AudioFileRow[]): Promise<void> {
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await isReadable(file.path);
      if (!exists) {
        // eslint-disable-next-line no-await-in-loop
        await this.processMissingFile(file);
      }
    }

    this.cleanUpAlbums();
    this.cleanUpArtists();
  }

  private cleanUpAlbums() {
    this.db
      .prepare(
        'DELETE FROM albums WHERE NOT EXISTS (SELECT id FROM songs WHERE songs.albumId = albums.id)',
      )
      .run();
  }

  private cleanUpArtists() {
    this.db
      .prepare(
        `DELETE FROM artists
         WHERE NOT EXISTS (SELECT id FROM albums WHERE albums.artistId = artists.id)
         AND NOT EXISTS (SELECT id FROM songs WHERE songs.artistId = artists.id)`,
      )
      .run();
  }

  private async processMissingFile(file: AudioFileRow) {
    printInfo(`[MusicCleaner] cannot find file on disk: ${file.path}`);

    if (this.options.removeMissing) {
      printInfo(`[MusicCleaner] removing file: ${file.path}`);

      try {
        this.audioFilesService.deleteById(file.id);
      } catch (err) {
        printError(
          `could not remove song for file ${file.id}: ${
            err instanceof Error ? err.message : 'unknown error'
          }`,
        );
      }
    }
  }
}
