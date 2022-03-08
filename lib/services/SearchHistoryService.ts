import { Knex } from 'knex';

import { AlbumsService } from './AlbumsService';
import { ArtistsService } from './ArtistsService';
import { SongsService } from './SongsService';

import {
  SearchHistoryEntry,
  AlbumSearchHistoryEntry,
  ArtistSearchHistoryEntry,
  SongSearchHistoryEntry,
} from '~/common';
import { generateUuid } from '~/helpers/uuid';
import { SearchHistoryRow } from '~/database/rows';

type Injects = {
  db: Knex;
  artistsService: ArtistsService;
  albumsService: AlbumsService;
  songsService: SongsService;
};

type SearchHistoryEntryFactory = (
  id: string,
  forId: string,
) => Promise<SearchHistoryEntry>;

export interface SearchHistoryService {
  createEntry(params: {
    userId: string;
    forType: 'artist' | 'album' | 'song';
    forId: string;
  }): Promise<SearchHistoryEntry>;
  findEntries(userId: string): Promise<SearchHistoryEntry[]>;
  deleteEntry(params: { userId: string; id: string }): Promise<void>;
}

export default function createSearchHistoryService({
  db,
  artistsService,
  albumsService,
  songsService,
}: Injects): SearchHistoryService {
  async function createArtistEntry(
    id: string,
    artistId: string,
  ): Promise<ArtistSearchHistoryEntry> {
    const artist = await artistsService.findById(artistId);
    return {
      id,
      type: 'artist',
      artist,
    };
  }

  async function createAlbumEntry(
    id: string,
    albumId: string,
  ): Promise<AlbumSearchHistoryEntry> {
    const album = await albumsService.findById(albumId);
    return {
      id,
      type: 'album',
      album,
    };
  }

  async function createSongEntry(
    id: string,
    songId: string,
  ): Promise<SongSearchHistoryEntry> {
    const song = await songsService.findById(songId);
    return {
      id,
      type: 'song',
      song,
    };
  }

  const entryFactories = new Map<string, SearchHistoryEntryFactory>([
    ['artist', createArtistEntry],
    ['album', createAlbumEntry],
    ['song', createSongEntry],
  ]);

  async function createEntryOrFail(
    forType: string,
    forId: string,
  ): Promise<SearchHistoryEntry> {
    const factory = entryFactories.get(forType);

    if (factory) {
      return factory(generateUuid(), forId);
    }

    throw Error(
      `encountered invalid type '${forType}' when adding search history entry`,
    );
  }

  return {
    async createEntry({ userId, forType, forId }) {
      const entry = await createEntryOrFail(forType, forId);

      const ids = {
        artistId: forType === 'artist' ? forId : null,
        albumId: forType === 'album' ? forId : null,
        songId: forType === 'song' ? forId : null,
      };

      await db('search_history')
        .delete()
        .where({
          userId,
          ...ids,
        });

      await db('search_history').insert({
        id: entry.id,
        userId,
        ...ids,
      });

      return entry;
    },

    async findEntries(userId) {
      const rows = await db('search_history')
        .where({ userId })
        .orderBy('search_history.createdAt', 'desc')
        .limit(10);

      async function populateEntry({
        id,
        artistId,
        albumId,
        songId,
      }: SearchHistoryRow): Promise<SearchHistoryEntry> {
        if (artistId) {
          return createArtistEntry(id, artistId);
        }

        if (albumId) {
          return createAlbumEntry(id, albumId);
        }

        if (songId) {
          return createSongEntry(id, songId);
        }

        throw Error(
          'cannot populate search history entry, expected one of albumId, artistId or songId to be defined',
        );
      }

      return Promise.all(rows.map(populateEntry));
    },

    async deleteEntry(params) {
      await db('search_history').delete().where(params);
    },
  };
}
