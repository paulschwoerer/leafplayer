import Knex from 'knex';

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

  constructor(
    private query: Knex,
    private audioFilesService: AudioFilesService,
  ) {}

  async run(options?: MusicCleanerOptions): Promise<void> {
    this.options = {
      ...this.options,
      ...options,
    };

    const audioFiles = await this.audioFilesService.findAll();

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

    await this.cleanUpAlbums();
    await this.cleanUpArtists();
  }

  private async cleanUpAlbums() {
    return this.query('albums')
      .whereNotExists(
        this.query('songs').select('id').whereRaw('songs.albumId = albums.id'),
      )
      .delete();
  }

  private async cleanUpArtists() {
    return this.query('artists')
      .whereNotExists(
        this.query('albums')
          .select('id')
          .whereRaw('albums.artistId = artists.id'),
      )
      .whereNotExists(
        this.query('songs')
          .select('id')
          .whereRaw('songs.artistId = artists.id'),
      )
      .delete();
  }

  private async processMissingFile(file: AudioFileRow) {
    printInfo(`[MusicCleaner] cannot find file on disk: ${file.path}`);

    if (this.options.removeMissing) {
      printInfo(`[MusicCleaner] removing file: ${file.path}`);

      const error = this.audioFilesService.deleteById(file.id);

      if (error instanceof Error) {
        printError(`could not remove song for file ${file.id}`);
        printInfo(error.message);
      }
    }
  }
}
