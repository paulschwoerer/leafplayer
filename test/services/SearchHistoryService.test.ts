import { generateUuid } from '../../lib/helpers/uuid.ts';
import createAlbumsService from '../../lib/services/AlbumsService.ts';
import createArtistsService, {
  type ArtistsService,
} from '../../lib/services/ArtistsService.ts';
import createSongsService from '../../lib/services/SongsService.ts';
import createSearchHistoryService from '../../lib/services/SearchHistoryService.ts';
import { NotFoundError } from '../../lib/errors/NotFoundError.ts';
import { type DB } from '../../lib/database/index.ts';
import createUsersService from '../../lib/services/UsersService.ts';
import { type SearchHistoryRow } from '../../lib/database/rows.ts';
import test from '../setupTestDB.ts';

function setupService(db: DB) {
  const songsService = createSongsService({ db });
  const albumsService = createAlbumsService({ db });
  const artistsService = createArtistsService({
    db,
    albumsService,
  });
  return createSearchHistoryService({
    db,
    artistsService,
    albumsService,
    songsService,
  });
}

test('findEntries -> it should return valid history entries', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: '',
    password: '-',
  });

  const songsService = createSongsService({ db });
  const albumsService = createAlbumsService({ db });
  const artistsService = createArtistsService({
    albumsService,
    db,
  });

  const yellowArtistId = artistsService.create({ name: 'Yellow Artist' });
  const greenArtistId = artistsService.create({ name: 'Green Artist' });

  albumsService.createAlbum({
    artistId: yellowArtistId,
    name: 'Red Album',
  });
  const greenAlbumId = albumsService.createAlbum({
    artistId: greenArtistId,
    name: 'Green Album',
  });

  const searchHistoryService = createSearchHistoryService({
    db,
    albumsService,
    artistsService,
    songsService,
  });

  searchHistoryService.createEntry({
    forType: 'album',
    forId: greenAlbumId,
    userId,
  });
  searchHistoryService.createEntry({
    forType: 'artist',
    forId: greenArtistId,
    userId,
  });

  const entries = searchHistoryService.findEntries(userId);

  t.plan(3);
  t.is(entries.length, 2);

  if (entries[0].type === 'album') {
    t.is(entries[0].album.name, 'Green Album');
  }

  if (entries[1].type === 'artist') {
    t.is(entries[1].artist.name, 'Green Artist');
  }
});

test('createEntry -> it should not create an entry for a non-existing entity', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: '',
    password: '-',
  });

  const service = setupService(db);

  t.throws(
    () =>
      service.createEntry({
        userId,
        forType: 'album',
        forId: generateUuid(),
      }),
    { instanceOf: NotFoundError },
  );
});

function makeArtistService(db: DB): ArtistsService {
  return createArtistsService({
    db,
    albumsService: createAlbumsService({ db }),
  });
}

test('createEntry -> it should create a new entry', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: '',
    password: '-',
  });

  const artistId = makeArtistService(db).create({
    name: 'Yellow Artist',
  });

  const service = setupService(db);

  const entry = service.createEntry({
    userId,
    forType: 'artist',
    forId: artistId,
  });

  t.plan(6);
  if (entry.type === 'artist') {
    t.is(entry.artist.id, artistId);
    t.is(entry.artist.name, 'Yellow Artist');
  }

  const dbEntry = db
    .prepare<unknown[], SearchHistoryRow>('SELECT * FROM search_history')
    .first();
  if (dbEntry) {
    t.is(dbEntry.userId, userId);
    t.is(dbEntry.artistId, artistId);
    t.is(dbEntry.albumId, null);
    t.is(dbEntry.songId, null);
  }
});

test('deleteEntry -> it should delete a given entry', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: '',
    password: '-',
  });

  const artistId = makeArtistService(db).create({
    name: 'Green Artist',
  });

  const service = setupService(db);

  const { id } = service.createEntry({
    forType: 'artist',
    forId: artistId,
    userId,
  });

  service.deleteEntry({
    userId,
    id,
  });

  t.is(db.prepare('SELECT * FROM search_history').all().length, 0);
});
