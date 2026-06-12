import path from 'path';

import { FullSong } from '@/common';
import { AudioFileRow, SongRow, WithoutTimestamps } from '@/database/rows';
import { isReadable, removeDir } from '@/helpers/filesystem';
import { generateUuid } from '@/helpers/uuid';
import { DB } from '@/database';

export type SavedSong = FullSong & { fileLastModified: number };

type Config = {
  storageDir: string;
};

type Injects = {
  db: DB;
  config: Config;
};

type SongParams = {
  fileId: string;
  albumId: string;
  artistId: string;
  title: string;
  duration: number;
  track: number | null;
  disk: number;
};

export interface LibraryService {
  updateSongByFileId(fileId: string, params: Omit<SongParams, 'fileId'>): void;
  createSong(params: SongParams): void;
  createAudioFile(params: Omit<AudioFileRow, 'id'>): string;
  updateAudioFile(
    id: string,
    params: {
      lastModified?: number;
      filesize?: number;
    },
  ): void;
  getAudioFileByPath(path: string): AudioFileRow | undefined;
  getEnabledMediaDirectories(): string[];
  getAllMediaDirectories(): string[];
  addMediaDirectory(path: string): Error | undefined;
  removeMediaDirectory(path: string): Error | undefined;
  wipeLibrary(): Promise<void>;
}

export default function createLibraryService({
  db,
  config,
}: Injects): LibraryService {
  return {
    updateSongByFileId(fileId, params) {
      db.prepare<SongParams>(
        `UPDATE songs
        SET
          albumId = :albumId,
          artistId = :artistId,
          title = :title,
          duration = :duration,
          track = :track,
          disk = :disk,
          updatedAt = NOW()
        WHERE fileId = :fileId`,
      ).run({ ...params, fileId });
    },

    createSong(params) {
      const id = generateUuid();

      db.prepare<WithoutTimestamps<SongRow>>(
        `INSERT INTO songs
            (id, fileId, albumId, artistId, title, duration, track, disk)
          VALUES
            (:id, :fileId, :albumId, :artistId, :title, :duration, :track, :disk)`,
      ).run({
        ...params,
        id,
      });
    },

    createAudioFile(params) {
      const id = generateUuid();

      db.prepare<AudioFileRow>(
        `INSERT INTO audio_files
            (id, path, format, filesize, lastModified)
          VALUES
            (:id, :path, :format, :filesize, :lastModified)`,
      ).run({
        ...params,
        id,
      });

      return id;
    },

    updateAudioFile(id, params) {
      db.prepare(
        `UPDATE audio_files
        SET
          filesize = :filesize,
          lastModified = :lastModified
        WHERE id = :id`,
      ).run({
        ...params,
        id,
      });
    },

    getAudioFileByPath(path) {
      return db
        .prepare<string, AudioFileRow>(
          'SELECT * FROM audio_files WHERE path = ?',
        )
        .first(path);
    },

    getEnabledMediaDirectories() {
      const rows = db
        .prepare<unknown[], { path: string }>(
          'SELECT path FROM media_folders WHERE enabled = TRUE',
        )
        .all();

      return rows.map(dir => dir.path);
    },

    getAllMediaDirectories() {
      const rows = db
        .prepare<unknown[], { path: string }>('SELECT path FROM media_folders')
        .all();

      return rows.map(dir => dir.path);
    },

    addMediaDirectory(path) {
      const directoryOk = isReadable(path);

      if (!directoryOk) {
        return Error('directory does not exist or is not readable');
      }

      db.prepare(
        'INSERT INTO media_folders (id, path) VALUES (:id, :path)',
      ).run({
        id: generateUuid(),
        path,
      });
    },

    removeMediaDirectory(path) {
      const count = db
        .prepare<string>('DELETE FROM media_folders WHERE path = ?')
        .run(path);

      if (count === 0) {
        return Error('not a media directory');
      }
    },

    async wipeLibrary() {
      // TODO: use transaction?
      db.prepare('DELETE FROM songs').run();
      db.prepare('DELETE FROM audio_files').run();
      db.prepare('DELETE FROM albums').run();
      db.prepare('DELETE FROM artists').run();

      await removeDir(path.join(config.storageDir, 'thumbnails'));
    },
  };
}
