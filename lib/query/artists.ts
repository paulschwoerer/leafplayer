import { Knex } from 'knex';

import { SortParam } from '~/typings/SortParam';

type ArtistsQueryBuilder = ReturnType<typeof query>;

export function createArtistQuery(db: Knex): ArtistsQueryBuilder {
  return query(db);
}

export function orderBy({ field, direction }: SortParam) {
  return (query: ArtistsQueryBuilder): ArtistsQueryBuilder => {
    return query.orderBy(`artists.${field}`, direction);
  };
}

function query(db: Knex) {
  return db('artists')
    .select(
      db.ref('id').withSchema('artists'),
      db.ref('name').withSchema('artists'),
      db.ref('createdAt').withSchema('artists'),
      db.ref('updatedAt').withSchema('artists'),
    )
    .leftJoin('albums', 'albums.artistId', 'artists.id')
    .leftJoin('songs', 'songs.artistId', 'artists.id')
    .countDistinct({ songCount: 'songs.id', albumCount: 'albums.id' });
}
