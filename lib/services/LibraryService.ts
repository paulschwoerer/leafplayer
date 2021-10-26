import path from 'path';

import { Knex } from 'knex';

import { FullSong } from '@/common';
import { AudioFileRow } from '@/database/rows';
import { isReadable, removeDir } from '@/helpers/filesystem';
import { generateUuid } from '@/helpers/uuid';

export type SavedSong = FullSong & { fileLastModified: number };

type Config = {
  storageDir: string;
};

type Injects = {
  db: Knex;
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
  updateSongByFileId(
    fileId: string,
    params: Partial<SongParams>,
  ): Promise<void>;
  createSong(params: SongParams): Promise<void>;
  createAudioFile(params: Omit<AudioFileRow, 'id'>): Promise<string>;
  updateAudioFile(
    id: string,
    params: {
      lastModified?: number;
      filesize?: number;
    },
  ): Promise<void>;
  getAudioFileByPath(path: string): Promise<AudioFileRow | undefined>;
  getEnabledMediaDirectories(): Promise<string[]>;
  getAllMediaDirectories(): Promise<string[]>;
  addMediaDirectory(path: string): Promise<Error | undefined>;
  removeMediaDirectory(path: string): Promise<Error | undefined>;
  wipeLibrary(): Promise<void>;
}

export function createLibraryService({ db, config }: Injects): LibraryService {
  return {
    async updateSongByFileId(fileId, params) {
      await db('songs')
        .update(params)
        .update('updatedAt', db.fn.now())
        .where({ fileId });
    },

    async createSong(params) {
      const id = generateUuid();

      await db('songs').insert({
        ...params,
        id,
      });
    },

    async createAudioFile(params) {
      const id = generateUuid();

      await db('audio_files').insert({
        ...params,
        id,
      });

      return id;
    },

    async updateAudioFile(id, params) {
      await db('audio_files').update(params).where({ id });
    },

    async getAudioFileByPath(path) {
      return db('audio_files').where({ path }).first();
    },

    async getEnabledMediaDirectories() {
      const rows = await db('media_folders')
        .select('path')
        .where({ enabled: true });

      return rows.map(dir => dir.path);
    },

    async getAllMediaDirectories() {
      const rows = await db('media_folders').select('path');

      return rows.map(dir => dir.path);
    },

    async addMediaDirectory(path) {
      const directoryOk = await isReadable(path);

      if (!directoryOk) {
        return Error('directory does not exist or is not readable');
      }

      await db('media_folders').insert({
        id: generateUuid(),
        path,
      });
    },

    async removeMediaDirectory(path) {
      const count = await db('media_folders').delete().where({
        path,
      });

      if (count === 0) {
        return Error('not a media directory');
      }
    },

    async wipeLibrary() {
      await db('songs').delete().where(true);
      await db('audio_files').delete().where(true);
      await db('albums').delete().where(true);
      await db('artists').delete().where(true);

      await removeDir(path.join(config.storageDir, 'thumbnails'));
    },
  };
}
