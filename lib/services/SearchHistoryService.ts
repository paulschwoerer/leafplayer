import type {
  SearchHistoryEntry,
  AlbumSearchHistoryEntry,
  ArtistSearchHistoryEntry,
  SongSearchHistoryEntry,
} from 'leafplayer-common';

import { generateUuid } from '../helpers/uuid.ts';
import { type SearchHistoryRow } from '../database/rows.ts';
import { type DB } from '../database/index.ts';

import { type AlbumsService } from './AlbumsService.ts';
import { type ArtistsService } from './ArtistsService.ts';
import { type SongsService } from './SongsService.ts';

type Injects = {
  db: DB;
  artistsService: ArtistsService;
  albumsService: AlbumsService;
  songsService: SongsService;
};

type SearchHistoryEntryFactory = (
  id: string,
  forId: string,
) => SearchHistoryEntry;

type DeleteParams = { userId: string; id: string };

export interface SearchHistoryService {
  createEntry(params: {
    userId: string;
    forType: 'artist' | 'album' | 'song';
    forId: string;
  }): SearchHistoryEntry;
  findEntries(userId: string): SearchHistoryEntry[];
  deleteEntry(params: DeleteParams): void;
}

export default function createSearchHistoryService({
  db,
  artistsService,
  albumsService,
  songsService,
}: Injects): SearchHistoryService {
  function createArtistEntry(
    id: string,
    artistId: string,
  ): ArtistSearchHistoryEntry {
    const artist = artistsService.findById(artistId);
    return {
      id,
      type: 'artist',
      artist,
    };
  }

  function createAlbumEntry(
    id: string,
    albumId: string,
  ): AlbumSearchHistoryEntry {
    const album = albumsService.findById(albumId);
    return {
      id,
      type: 'album',
      album,
    };
  }

  function createSongEntry(id: string, songId: string): SongSearchHistoryEntry {
    const song = songsService.findById(songId);
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

  function createEntryOrFail(
    forType: string,
    forId: string,
  ): SearchHistoryEntry {
    const factory = entryFactories.get(forType);

    if (factory) {
      return factory(generateUuid(), forId);
    }

    throw Error(
      `encountered invalid type '${forType}' when adding search history entry`,
    );
  }

  return {
    createEntry({ userId, forType, forId }) {
      const entry = createEntryOrFail(forType, forId);

      const ids = {
        artistId: forType === 'artist' ? forId : null,
        albumId: forType === 'album' ? forId : null,
        songId: forType === 'song' ? forId : null,
      };

      db.prepare(
        `DELETE FROM search_history
         WHERE userId = :userId
          AND artistId = :artistId
          AND albumId = :albumId
          AND songId = :songId`,
      ).run({
        userId,
        ...ids,
      });

      db.prepare<SearchHistoryRow>(
        `INSERT INTO search_history
            (id, userId, artistId, albumId, songId)
          VALUES
            (:id, :userId, :artistId, :albumId, :songId)`,
      ).run({
        id: entry.id,
        userId,
        ...ids,
      });

      return entry;
    },

    findEntries(userId) {
      const rows = db
        .prepare<string, SearchHistoryRow>(
          'SELECT * FROM search_history WHERE userId = ? ORDER BY createdAt DESC LIMIT 10',
        )
        .all(userId);

      function populateEntry({
        id,
        artistId,
        albumId,
        songId,
      }: SearchHistoryRow): SearchHistoryEntry {
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

      return rows.map(populateEntry);
    },

    deleteEntry(params) {
      db.prepare<DeleteParams>(
        'DELETE FROM search_history WHERE id = :id AND userId = :userId',
      ).run(params);
    },
  };
}
