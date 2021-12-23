import { Knex } from 'knex';
import { AlbumRow } from 'lib/database/rows';

import { FullArtist } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { toFullArtist } from '@/mappers/artists';
import { toFullSong } from '@/mappers/songs';
import { createAlbumsQuery } from '@/query/albums';
import { createArtistQuery } from '@/query/artists';
import { createSongsQuery } from '@/query/songs';
import { weighStringsUsingSearchTerm } from '@/helpers/search';

import { FullAlbum, FullSong } from './../../common/entities';

type Injects = {
  db: Knex;
};

export interface SearchService {
  search(q: string): Promise<{
    artists: FullArtist[];
    albums: FullAlbum[];
    songs: FullSong[];
  }>;
}

export default function createSearchService({ db }: Injects): SearchService {
  const artistCount = 5;
  const albumCount = 5;
  const songCount = 10;

  async function searchArtists(q: string) {
    const rows = await createArtistQuery(db)
      .groupBy('artists.id')
      .orWhereRaw('artists.name LIKE ?', [`%${q}%`]);

    const weightedRows = rows.sort((a, b): number => {
      return weighStringsUsingSearchTerm(q, a.name, b.name);
    });

    return weightedRows.slice(0, artistCount).map(toFullArtist);
  }

  async function searchAlbums(q: string) {
    type Row = AlbumRow & { artistName: string };

    const rows = await createAlbumsQuery(db)
      .whereRaw('albums.name LIKE ?', [`%${q}%`])
      .orWhereRaw('artists.name LIKE ?', [`%${q}%`]);

    const weightedRows = rows.sort((a: Row, b: Row): number => {
      return weighStringsUsingSearchTerm(q, a.name, b.name);
    });

    return weightedRows.slice(0, albumCount).map(toFullAlbum);
  }

  async function searchSongs(q: string) {
    const rows = await createSongsQuery(db)
      .where('songs.title', 'like', `%${q}%`)
      .orWhere('artists.name', 'like', `%${q}%`)
      .orWhere('albums.name', 'like', `%${q}%`);

    const weightedRows = rows.sort((a, b): number => {
      return weighStringsUsingSearchTerm(q, a.title, b.title);
    });

    return weightedRows.slice(0, songCount).map(toFullSong);
  }

  return {
    async search(q: string) {
      const artists = await searchArtists(q);
      const albums = await searchAlbums(q);
      const songs = await searchSongs(q);

      return {
        artists,
        albums,
        songs,
      };
    },
  };
}
