import { DB } from '@/database';
import { AudioFileRow } from '@/database/rows';

export interface AudioFilesService {
  findById(id: string): AudioFileRow | undefined;
  findAll(): AudioFileRow[];
  findBySongId(songId: string): AudioFileRow | undefined;
  deleteById(id: string): void;
}

type Injects = {
  db: DB;
};

export default function createAudioFilesService({
  db,
}: Injects): AudioFilesService {
  return {
    findById(id) {
      return db
        .prepare<string, AudioFileRow>('SELECT * FROM audio_files WHERE id = ?')
        .first(id);
    },

    findBySongId(songId) {
      const row = db
        .prepare<string, AudioFileRow>(
          `SELECT
            audio_files.*
          FROM audio_files
          INNER JOIN songs
            ON audio_files.id = songs.fileId
          WHERE songs.id = ?`,
        )
        .first(songId);

      return row;
    },

    findAll() {
      return db
        .prepare<unknown[], AudioFileRow>('SELECT * FROM audio_files')
        .all();
    },

    deleteById(id) {
      return db.prepare<string>('DELETE FROM audio_files WHERE id = ?').run(id);
    },
  };
}
