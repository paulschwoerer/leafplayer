import { FullArtist, FullAlbum, FullSong } from '@/common';

import { AlbumRow } from '../database/rows.ts';
import { toFullAlbum } from '../mappers/albums.ts';
import { toFullArtist } from '../mappers/artists.ts';
import { toFullSong } from '../mappers/songs.ts';
import { prepareAlbumsQuery } from '../query/albums.ts';
import { prepareArtistsQuery } from '../query/artists.ts';
import { prepareSongsQuery } from '../query/songs.ts';
import { weighStringsUsingSearchTerm } from '../helpers/search.ts';
import { DB } from '../database/index.ts';

type Injects = {
  db: DB;
};

export interface SearchService {
  search(q: string): {
    artists: FullArtist[];
    albums: FullAlbum[];
    songs: FullSong[];
  };
}

export default function createSearchService({ db }: Injects): SearchService {
  const artistCount = 5;
  const albumCount = 5;
  const songCount = 10;

  function searchArtists(q: string) {
    const rows = prepareArtistsQuery<{ q: string }>(
      db,
      'WHERE artists.name LIKE :q GROUP BY artists.id',
    ).all({ q: `%${q}%` });

    const weightedRows = rows.sort((a, b): number => {
      return weighStringsUsingSearchTerm(q, a.name, b.name);
    });

    return weightedRows.slice(0, artistCount).map(toFullArtist);
  }

  function searchAlbums(q: string) {
    type Row = AlbumRow & { artistName: string };

    const rows = prepareAlbumsQuery<{ q: string }>(
      db,
      'WHERE albums.name LIKE :q OR artists.name LIKE :q',
    ).all({ q: `%${q}%` });

    const weightedRows = rows.sort((a: Row, b: Row): number => {
      return weighStringsUsingSearchTerm(q, a.name, b.name);
    });

    return weightedRows.slice(0, albumCount).map(toFullAlbum);
  }

  function searchSongs(q: string) {
    const rows = prepareSongsQuery(
      db,
      'WHERE songs.title LIKE :q OR albums.name LIKE :q OR artists.name LIKE :q ',
    ).all({ q: `%${q}%` });

    const weightedRows = rows.sort((a, b): number => {
      return weighStringsUsingSearchTerm(q, a.title, b.title);
    });

    return weightedRows.slice(0, songCount).map(toFullSong);
  }

  return {
    search(q: string) {
      const artists = searchArtists(q);
      const albums = searchAlbums(q);
      const songs = searchSongs(q);

      return {
        artists,
        albums,
        songs,
      };
    },
  };
}
