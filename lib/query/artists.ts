import Knex from 'knex';

type ArtistsQueryBuilder = ReturnType<typeof query>;

export function createArtistQuery(db: Knex): ArtistsQueryBuilder {
  return query(db);
}

export function orderByName() {
  return (query: ArtistsQueryBuilder): ArtistsQueryBuilder =>
    query.orderBy('artists.name', 'asc');
}

function query(db: Knex) {
  return db('artists')
    .select(
      db.ref('id').withSchema('artists'),
      db.ref('name').withSchema('artists'),
    )
    .leftJoin('albums', 'albums.artistId', 'artists.id')
    .leftJoin('songs', 'songs.artistId', 'artists.id')
    .orderBy('artists.name', 'asc')
    .countDistinct({ songCount: 'songs.id', albumCount: 'albums.id' });
}
