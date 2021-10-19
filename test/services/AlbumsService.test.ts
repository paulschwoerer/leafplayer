import anyTest, { TestInterface } from 'ava';
import Knex from 'knex';

import { createAlbumsService } from '@/services/AlbumsService';
import { createSongsService } from '@/services/SongsService';

import { afterEachHook, beforeEachHook, TestContext } from '../testContext';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

function createServiceUnderTest(db: Knex) {
  return createAlbumsService({
    db,
    songsService: createSongsService({ db }),
  });
}

test('find -> it should find and sort albums', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert({
    id: 'e8b04958-37aa-4b4e-82ac-da2f639d1574',
    name: 'Artist',
  });
  await db('albums').insert([
    {
      id: '5484a8cd-e1f7-4192-a644-8932592bcf19',
      artistId: 'e8b04958-37aa-4b4e-82ac-da2f639d1574',
      name: 'Favourite Album',
      year: 2004,
    },
    {
      id: 'f69ac645-d325-46a6-9b1c-001dff63f8d9',
      artistId: 'e8b04958-37aa-4b4e-82ac-da2f639d1574',
      name: 'Least Favourite Album',
      year: 2002,
    },
    {
      id: '2dd1ab22-5be5-49ed-a006-643ad8d1db63',
      artistId: 'e8b04958-37aa-4b4e-82ac-da2f639d1574',
      name: 'Best Album',
      year: 1985,
    },
  ]);

  const albumsService = createServiceUnderTest(db);

  const albumsSortedByName = await albumsService.find();
  const albumsSortedByYear = await albumsService.find({
    direction: 'desc',
    field: 'year',
  });

  is(albumsSortedByName[0].name, 'Best Album');
  is(albumsSortedByName[1].name, 'Favourite Album');
  is(albumsSortedByName[2].name, 'Least Favourite Album');

  is(albumsSortedByYear[0].name, 'Favourite Album');
  is(albumsSortedByYear[1].name, 'Least Favourite Album');
  is(albumsSortedByYear[2].name, 'Best Album');
});
