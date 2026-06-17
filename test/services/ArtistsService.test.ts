import createAlbumsService from '../../lib/services/AlbumsService.ts';
import createArtistsService from '../../lib/services/ArtistsService.ts';
import { FileFormat } from '../../lib/scanner/types.ts';
import createLibraryService from '../../lib/services/LibraryService.ts';
import test from '../setupTestDB.ts';
import { createLeafplayerConfig } from '../testHelpers.ts';

test('find -> it should find and sort artists', t => {
  const { db } = t.context;

  const artistsService = createArtistsService({
    albumsService: createAlbumsService({ db }),
    db,
  });

  artistsService.create({
    name: 'Favourite Artist',
  });
  artistsService.create({
    name: 'Least Favourite Artist',
  });
  artistsService.create({
    name: 'Best Artist',
  });

  const artistsAsc = artistsService.find();
  const artistsDesc = artistsService.find({
    direction: 'desc',
    field: 'name',
  });

  t.is(artistsAsc[0].name, 'Best Artist');
  t.is(artistsAsc[1].name, 'Favourite Artist');
  t.is(artistsAsc[2].name, 'Least Favourite Artist');

  t.is(artistsDesc[0].name, 'Least Favourite Artist');
  t.is(artistsDesc[1].name, 'Favourite Artist');
  t.is(artistsDesc[2].name, 'Best Artist');
});

test('findById -> it should return an artist', t => {
  const { db } = t.context;

  const artistsService = createArtistsService({
    albumsService: createAlbumsService({ db }),
    db,
  });

  const artistId = artistsService.create({
    name: 'Artist',
  });

  const artist = artistsService.findById(artistId);

  t.is(artist.name, 'Artist');
});

test('findById -> it should return an artist with album and song count of zero', t => {
  const { db } = t.context;

  const artistsService = createArtistsService({
    albumsService: createAlbumsService({ db }),
    db,
  });

  const artistId = artistsService.create({
    name: 'Musicless Artist',
  });

  const artist = artistsService.findById(artistId);

  t.is(artist.albumCount, 0);
  t.is(artist.songCount, 0);
});

test('findById -> it should return an artist with album count of two', t => {
  const { db } = t.context;

  const albumsService = createAlbumsService({
    db,
  });
  const artistsService = createArtistsService({
    albumsService,
    db,
  });

  const artistId = artistsService.create({
    name: 'Artist',
  });

  albumsService.createAlbum({
    artistId,
    name: 'Album 1',
  });
  albumsService.createAlbum({
    artistId,
    name: 'Album 2',
  });

  const artist = artistsService.findById(artistId);

  t.is(artist.albumCount, 2);
});

test('findById -> it should return an artist with song count of two', t => {
  const { db } = t.context;

  const albumsService = createAlbumsService({
    db,
  });
  const artistsService = createArtistsService({
    albumsService,
    db,
  });
  const libraryService = createLibraryService({
    config: createLeafplayerConfig(),
    db,
  });

  const artistId = artistsService.create({
    name: 'Artist',
  });
  const albumId = albumsService.createAlbum({
    artistId,
    name: 'Album 1',
  });

  const fileId = libraryService.createAudioFile({
    path: '',
    filesize: 10,
    format: FileFormat.MP3,
    lastModified: 0,
  });

  libraryService.createSong({
    artistId,
    albumId,
    fileId,
    title: 'Song 1',
    duration: 0,
    disk: 1,
    track: 1,
  });
  libraryService.createSong({
    artistId,
    albumId,
    fileId,
    title: 'Song 2',
    duration: 0,
    disk: 1,
    track: 2,
  });

  const artist = artistsService.findById(artistId);

  t.is(artist.songCount, 2);
});
