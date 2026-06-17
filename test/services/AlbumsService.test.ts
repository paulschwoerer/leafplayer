import createAlbumsService from '../../lib/services/AlbumsService.ts';
import createArtistsService from '../../lib/services/ArtistsService.ts';
import test from '../setupTestDB.ts';

test('find -> it should find and sort albums', t => {
  const { db } = t.context;

  const albumsService = createAlbumsService({
    db,
  });

  const artistsService = createArtistsService({
    db,
    albumsService,
  });

  const artistId = artistsService.create({
    name: 'Artist',
  });

  albumsService.createAlbum({
    artistId,
    name: 'Favourite Album',
    year: 2004,
  });
  albumsService.createAlbum({
    artistId,
    name: 'Least Favourite Album',
    year: 2002,
  });
  albumsService.createAlbum({
    artistId,
    name: 'Best Album',
    year: 1985,
  });

  const albumsSortedByName = albumsService.find();
  const albumsSortedByYear = albumsService.find({
    direction: 'desc',
    field: 'year',
  });

  t.is(albumsSortedByName[0].name, 'Best Album');
  t.is(albumsSortedByName[1].name, 'Favourite Album');
  t.is(albumsSortedByName[2].name, 'Least Favourite Album');

  t.is(albumsSortedByYear[0].name, 'Favourite Album');
  t.is(albumsSortedByYear[1].name, 'Least Favourite Album');
  t.is(albumsSortedByYear[2].name, 'Best Album');
});
