import { Knex } from 'knex';

import { SortParam } from '@/typings/SortParam';

type AlbumsQueryBuilder = ReturnType<typeof query>;

export function createAlbumsQuery(db: Knex): AlbumsQueryBuilder {
  return query(db);
}

export function orderBy({ field, direction }: SortParam) {
  return (query: AlbumsQueryBuilder): AlbumsQueryBuilder => {
    return query.orderBy(`albums.${field}`, direction);
  };
}

export function orderByYearDesc() {
  return (query: AlbumsQueryBuilder): AlbumsQueryBuilder =>
    query.orderBy('albums.year', 'desc');
}

function query(db: Knex) {
  return db('albums')
    .select(
      db.ref('id').withSchema('albums'),
      db.ref('name').withSchema('albums'),
      db.ref('year').withSchema('albums'),
      db.ref('createdAt').withSchema('albums'),
      db.ref('updatedAt').withSchema('albums'),
      db.ref('id').as('artistId').withSchema('artists'),
      db.ref('name').as('artistName').withSchema('artists'),
    )
    .innerJoin('artists', 'albums.artistId', 'artists.id');
}
