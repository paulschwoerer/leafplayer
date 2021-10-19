import { createReadStream } from 'fs';
import path from 'path';
import { Stream } from 'stream';
import { isReadable, statFile } from '@/helpers/filesystem';

type StreamWithSize = {
  stream: Stream;
  size: number;
};

export interface ArtworksService {
  createArtworkStream(
    prefix: string,
    id: string,
    size: number,
  ): Promise<StreamWithSize | Error>;
}

type Injects = {
  config: {
    storageDir: string;
  };
};

export function createArtworksService({ config }: Injects): ArtworksService {
  return {
    async createArtworkStream(prefix, id, size) {
      const artworkPath = path.join(
        config.storageDir,
        'thumbnails',
        `${prefix}-${id}-${size}.jpg`,
      );

      if (!(await isReadable(artworkPath))) {
        return Error(
          `artwork path does not exist or is not readable: ${artworkPath}`,
        );
      }

      const stats = await statFile(artworkPath);

      if (!stats.isFile()) {
        return Error(`artwork path not a file: ${artworkPath}`);
      }

      return { stream: createReadStream(artworkPath), size: stats.size };
    },
  };
}
