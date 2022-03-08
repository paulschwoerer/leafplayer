import { Knex } from 'knex';

import { AudioFileRow } from '~/database/rows';

export interface AudioFilesService {
  findById(id: string): Promise<AudioFileRow | undefined>;
  findAll(): Promise<AudioFileRow[]>;
  findBySongId(songId: string): Promise<AudioFileRow | undefined>;
  deleteById(id: string): Promise<void>;
}

type Injects = {
  db: Knex;
};

export default function createAudioFilesService({
  db,
}: Injects): AudioFilesService {
  return {
    findById(id) {
      return db('audio_files').where({ id }).first();
    },

    async findBySongId(songId) {
      const row = await db('audio_files')
        .select(
          db.ref('id').withSchema('audio_files'),
          db.ref('path').withSchema('audio_files'),
          db.ref('format').withSchema('audio_files'),
          db.ref('filesize').withSchema('audio_files'),
          db.ref('lastModified').withSchema('audio_files'),
        )
        .innerJoin('songs', 'audio_files.id', 'songs.fileId')
        .where('songs.id', songId)
        .first();

      return row;
    },

    findAll() {
      return db('audio_files').where(true);
    },

    async deleteById(id) {
      return db('audio_files').where({ id }).delete();
    },
  };
}
