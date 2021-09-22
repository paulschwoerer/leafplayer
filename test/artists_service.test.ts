import anyTest, { TestInterface } from 'ava';
import Knex from 'knex';
import { createAlbumsService } from '../lib/services/AlbumsService';
import { createArtistsService } from '../lib/services/ArtistsService';
import { createSongsService } from '../lib/services/SongsService';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import {
  insertDummyAlbum,
  insertDummyArtist,
  insertDummySongs,
} from './testMediaHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

test('findAll -> Retrieving all artists', async t => {
  const { db } = t.context;

  const artistId = await insertArtistWithAlbumAndTwoSongs(db);

  const songsService = createSongsService({ db });
  const artistsService = createArtistsService({
    db,
    songsService,
    albumsService: createAlbumsService({ db, songsService }),
  });

  const [artist] = await artistsService.findAll();

  t.is(artist?.id, artistId);
  t.is(artist?.albumCount, 1);
  t.is(artist?.songCount, 2);
});

test('findById -> Retrieving artist without albums, expect an albumCount of 0 is set', async t => {
  const { db } = t.context;

  const artistId = await insertArtistWithOneSong(db);

  const songsService = createSongsService({ db });
  const artistsService = createArtistsService({
    db,
    songsService,
    albumsService: createAlbumsService({ db, songsService }),
  });

  const artist = await artistsService.findById(artistId);

  t.is(artist?.id, artistId);
  t.is(artist?.albumCount, 0);
  t.is(artist?.songCount, 1);
});

test('findById -> Retrieving a single artist', async t => {
  const { db } = t.context;

  const artistId = await insertArtistWithAlbumAndTwoSongs(db);

  const songsService = createSongsService({ db });
  const artistsService = createArtistsService({
    db,
    songsService,
    albumsService: createAlbumsService({ db, songsService }),
  });

  const artist = await artistsService.findById(artistId);

  t.is(artist?.id, artistId);
  t.is(artist?.albumCount, 1);
  t.is(artist?.songCount, 2);
});

test('findById -> Retrieving an artist without albums results in the artist with albumCount set to 0', async t => {
  const { db } = t.context;

  const artistId = await insertArtistWithOneSong(db);

  const songsService = createSongsService({ db });
  const artistsService = createArtistsService({
    db,
    songsService,
    albumsService: createAlbumsService({ db, songsService }),
  });

  const artist = await artistsService.findById(artistId);

  t.is(artist?.id, artistId);
  t.is(artist?.albumCount, 0);
  t.is(artist?.songCount, 1);
});

async function insertArtistWithAlbumAndTwoSongs(db: Knex): Promise<string> {
  const artistId = await insertDummyArtist(db);
  const albumId = await insertDummyAlbum(db, artistId);
  await insertDummySongs(db, artistId, albumId, 2);

  return artistId;
}

async function insertArtistWithOneSong(db: Knex): Promise<string> {
  const artistId = await insertDummyArtist(db);
  const albumArtistId = await insertDummyArtist(db);
  const albumId = await insertDummyAlbum(db, albumArtistId);
  await insertDummySongs(db, artistId, albumId, 1);

  return artistId;
}
