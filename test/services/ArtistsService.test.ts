import { createAlbumsService } from '@/services/AlbumsService';
import { createArtistsService } from '@/services/ArtistsService';
import { createSongsService } from '@/services/SongsService';
import anyTest, { TestInterface } from 'ava';
import Knex from 'knex';
import { FileFormat } from '../../lib/scanner/types';
import { afterEachHook, beforeEachHook, TestContext } from '../testContext';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

function createServiceUnderTest(db: Knex) {
  const songsService = createSongsService({ db });
  return createArtistsService({
    db,
    albumsService: createAlbumsService({ db, songsService }),
    songsService,
  });
}

test('find -> it should find and sort artists', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert([
    {
      id: 'e7d6b934-a264-4661-a888-53f3e63aefe8',
      name: 'Favourite Artist',
    },
    {
      id: '3ea21f72-c96a-4bcc-8d17-2b07bcf281ed',
      name: 'Least Favourite Artist',
    },
    {
      id: '104cb5fb-d114-449f-b955-045b894e6b30',
      name: 'Best Artist',
    },
  ]);

  const artistsService = createServiceUnderTest(db);

  const artistsAsc = await artistsService.find();
  const artistsDesc = await artistsService.find({
    direction: 'desc',
    field: 'name',
  });

  is(artistsAsc[0].name, 'Best Artist');
  is(artistsAsc[1].name, 'Favourite Artist');
  is(artistsAsc[2].name, 'Least Favourite Artist');

  is(artistsDesc[0].name, 'Least Favourite Artist');
  is(artistsDesc[1].name, 'Favourite Artist');
  is(artistsDesc[2].name, 'Best Artist');
});

test('findById -> it should return an artist', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert({
    id: '5e6195d4-62e8-4a8a-a2c8-9918d4b6a76b',
    name: 'Artist',
  });

  const artistsService = createServiceUnderTest(db);

  const artist = await artistsService.findById(
    '5e6195d4-62e8-4a8a-a2c8-9918d4b6a76b',
  );

  is(artist?.name, 'Artist');
});

test('findById -> it should return an artist with album and song count of zero', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert({
    id: 'af92c305-bcd5-462a-90f5-6d148e265e7a',
    name: 'Musicless Artist',
  });

  const artistsService = createServiceUnderTest(db);

  const artist = await artistsService.findById(
    'af92c305-bcd5-462a-90f5-6d148e265e7a',
  );

  is(artist?.albumCount, 0);
  is(artist?.songCount, 0);
});

test('findById -> it should return an artist with album count of two', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert({
    id: 'a91b6ad5-a145-4633-8789-f7db2c48c1f9',
    name: 'Artist',
  });

  await db('albums').insert([
    {
      id: '5e0ad91b-f171-4250-a9bf-123cf5ad6363',
      name: 'Album 1',
      artistId: 'a91b6ad5-a145-4633-8789-f7db2c48c1f9',
    },
    {
      id: '20434450-6cb4-4360-86d1-11cdcbe53638',
      name: 'Album 2',
      artistId: 'a91b6ad5-a145-4633-8789-f7db2c48c1f9',
    },
  ]);

  const artistsService = createServiceUnderTest(db);

  const artist = await artistsService.findById(
    'a91b6ad5-a145-4633-8789-f7db2c48c1f9',
  );

  is(artist?.albumCount, 2);
});

test('findById -> it should return an artist with song count of two', async ({
  context: { db },
  is,
}) => {
  await db('artists').insert({
    id: 'a1e3377a-d1fe-470f-9311-c8d4999ec55b',
    name: 'Artist',
  });

  await db('albums').insert([
    {
      id: '9329286c-df16-4737-9010-682e70c704fc',
      name: 'Album 1',
      artistId: 'a1e3377a-d1fe-470f-9311-c8d4999ec55b',
    },
  ]);

  await db('audio_files').insert({
    id: '336821d6-dcf2-4dc3-b51d-05a8dc563658',
    path: '',
    filesize: 10,
    format: FileFormat.MP3,
    lastModified: 0,
  });

  await db('songs').insert([
    {
      id: 'd4bfdc11-6c4b-49d8-b4b4-b3ef5b585871',
      albumId: '9329286c-df16-4737-9010-682e70c704fc',
      fileId: '336821d6-dcf2-4dc3-b51d-05a8dc563658',
      title: 'Song 1',
      duration: 0,
      artistId: 'a1e3377a-d1fe-470f-9311-c8d4999ec55b',
    },
    {
      id: 'e4419d4a-f5d0-41ee-bd24-a8364d0e5ae7',
      albumId: '9329286c-df16-4737-9010-682e70c704fc',
      fileId: '336821d6-dcf2-4dc3-b51d-05a8dc563658',
      title: 'Song 2',
      duration: 0,
      artistId: 'a1e3377a-d1fe-470f-9311-c8d4999ec55b',
    },
  ]);

  const artistsService = createServiceUnderTest(db);

  const artist = await artistsService.findById(
    'a1e3377a-d1fe-470f-9311-c8d4999ec55b',
  );

  is(artist?.songCount, 2);
});
