import { mkdir } from 'fs';
import path, { join as joinPath } from 'path';

import sharp from 'sharp';

import { printError, printInfo } from '@/helpers/cli';
import { getErrorMessage } from '@/helpers/errors';

type ArtworkFileSource = {
  type: 'file';
  path: string;
};

type ArtworkMemorySource = {
  type: 'memory';
  buffer: Buffer;
};

type ArtworkSource = ArtworkFileSource | ArtworkMemorySource;

function ensureDirectoryExists(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdir(path, err => {
      if (!err || err.code === 'EEXIST') {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

export default class ArtworkProcessor {
  private isWorking = false;
  private outputPath;
  private thumbnailSizes = [512, 384, 256, 192, 128, 96];

  private albumArtworks: Record<string, ArtworkSource> = {};
  private artistArtworks: Record<string, ArtworkSource> = {};

  constructor(storageDir: string) {
    this.outputPath = path.join(storageDir, 'thumbnails');
  }

  addAlbumArtwork(albumId: string, source: ArtworkSource): void {
    if (this.isWorking) {
      throw new Error('[ArtworkProcessor] cannot add artworks while working');
    }

    if (!this.albumArtworks[albumId]) {
      this.albumArtworks[albumId] = source;
    }
  }

  addArtistArtwork(artistId: string, source: ArtworkSource): void {
    if (this.isWorking) {
      throw new Error('[ArtworkProcessor] cannot add artworks while working');
    }

    if (!this.artistArtworks[artistId]) {
      this.artistArtworks[artistId] = source;
    }
  }

  async work(): Promise<void> {
    const start = Date.now();
    this.isWorking = true;

    await ensureDirectoryExists(this.outputPath);

    for (const albumId in this.albumArtworks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.saveArtwork('album', albumId, this.albumArtworks[albumId]);
      } catch (e) {
        printError(`Could not process artwork for album ${albumId}`);
        printError(getErrorMessage(e));
      }
    }

    for (const artistId in this.artistArtworks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.saveArtwork(
          'artist',
          artistId,
          this.artistArtworks[artistId],
        );
      } catch (e) {
        printError(`Could not process artwork for artist ${artistId}`);
        printError(getErrorMessage(e));
      }
    }

    const duration = (Date.now() - start) / 1000;
    printInfo(`Finished processing artworks in ${duration}s`);
  }

  private async saveArtwork(
    prefix: 'album' | 'artist',
    id: string,
    source: ArtworkSource,
  ): Promise<void> {
    const sourceData = source.type === 'file' ? source.path : source.buffer;

    await Promise.all(
      this.thumbnailSizes.map(async size =>
        sharp(sourceData)
          .resize(size, size)
          .jpeg()
          .toFile(this.buildThumbnailPath(prefix, id, size)),
      ),
    );
  }

  private buildThumbnailPath(prefix: string, id: string, size: number) {
    return joinPath(this.outputPath, `${prefix}-${id}-${size}.jpg`);
  }
}
