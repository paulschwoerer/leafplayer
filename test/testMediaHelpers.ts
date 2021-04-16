import Knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { FileFormat } from '../lib/scanner/types';

export async function insertDummyArtist(db: Knex): Promise<string> {
  const id = uuidv4();

  await db('artists').insert({
    id,
    name: 'Test Artist 1',
  });

  return id;
}

export async function insertDummyAlbum(
  db: Knex,
  artistId: string,
): Promise<string> {
  const id = uuidv4();

  await db('albums').insert({
    id,
    artistId,
    name: 'Test Album 1',
    year: 2000,
  });

  return id;
}

export async function insertDummySongs(
  db: Knex,
  artistId: string,
  albumId: string,
  count: number,
): Promise<string[]> {
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    ids.push(uuidv4());
  }

  const files = ids.map(id => ({
    id,
    filesize: 0,
    format: FileFormat.MP3,
    lastModified: 0,
    path: '/tmp/dummy.mp3',
  }));

  await db('audio_files').insert(files);

  const songs = ids.map((fileId, index) => ({
    id: uuidv4(),
    fileId,
    albumId,
    artistId,
    duration: 1,
    title: `Test Song ${index + 1}`,
    track: index + 1,
  }));

  await db('songs').insert(songs);

  return songs.map(({ id }) => id);
}
