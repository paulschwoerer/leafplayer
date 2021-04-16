import Knex from 'knex';
import { FullSong } from '@common';
import path from 'path';
import { AudioFileRow, SongRow } from '../database/rows';
import { isReadable, removeDir } from '../helpers/filesystem';
import { generateUuid } from '../helpers/uuid';

export type SavedSong = FullSong & { fileLastModified: number };

type Config = {
  storageDir: string;
};

type Injects = {
  db: Knex;
  config: Config;
};

export interface LibraryService {
  updateSongByFileId(
    fileId: string,
    params: Partial<Omit<SongRow, 'id' | 'fileId'>>,
  ): Promise<void>;
  createSong(params: Omit<SongRow, 'id'>): Promise<void>;
  createAudioFile(params: Omit<AudioFileRow, 'id'>): Promise<string>;
  updateAudioFile(
    id: string,
    params: {
      lastModified?: number;
      filesize?: number;
    },
  ): Promise<Error | undefined>;
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
      await db('songs').update(params).where({ fileId });
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
      try {
        await db('audio_files').update(params).where({ id });
      } catch (e) {
        return e;
      }
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
