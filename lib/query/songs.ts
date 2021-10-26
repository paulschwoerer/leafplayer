import { Knex } from 'knex';

type SongsQueryBuilder = ReturnType<typeof query>;

export function createSongsQuery(db: Knex): SongsQueryBuilder {
  return query(db);
}

export function orderByDiscAndTrack() {
  return (query: SongsQueryBuilder): SongsQueryBuilder =>
    query.orderBy('songs.disk', 'asc').orderBy('songs.track', 'asc');
}

function query(db: Knex) {
  return db('songs')
    .select(
      db.ref('id').withSchema('songs'),
      db.ref('track').withSchema('songs'),
      db.ref('disk').withSchema('songs'),
      db.ref('title').withSchema('songs'),
      db.ref('duration').withSchema('songs'),
      db.ref('artistId').withSchema('songs'),
      db.ref('albumId').withSchema('songs'),
      db.ref('name').withSchema('albums').as('albumName'),
      db.ref('name').withSchema('artists').as('artistName'),
      db.ref('createdAt').withSchema('songs'),
      db.ref('updatedAt').withSchema('songs'),
    )
    .from('songs')
    .innerJoin('albums', 'songs.albumId', 'albums.id')
    .innerJoin('artists', 'songs.artistId', 'artists.id');
}
