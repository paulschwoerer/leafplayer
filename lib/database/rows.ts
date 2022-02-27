import { Knex } from 'knex';

import { FileFormat } from '@/scanner/types';

type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

export type UserRow = Timestamps & {
  id: string;
  username: string;
  displayName: string;
  password: string;
};

export type InvitationRow = Timestamps & {
  id: number;
  code: string;
  used: boolean;
  expiresAt: number;
  comment: string | null;
};

export type AlbumRow = Timestamps & {
  id: string;
  artistId: string;
  name: string;
  year: number | null;
};

export type ArtistRow = Timestamps & {
  id: string;
  name: string;
};

export type AudioFileRow = {
  id: string;
  path: string;
  format: FileFormat;
  filesize: number;
  lastModified: number;
};

export type SongRow = Timestamps & {
  id: string;
  fileId: string;
  albumId: string;
  artistId: string;
  title: string;
  duration: number;
  track: number | null;
  disk: number;
};

export type MediaFolderRow = {
  id: string;
  path: string;
  enabled: boolean;
};

export type SessionRow = {
  id: string;
  userId: string;
  token: string;
  browser: string;
  os: string;
  lastUsedAt: number;
  expiresAt: number;
};

export type SearchHistoryRow = {
  id: string;
  userId: string;
  artistId: string | null;
  albumId: string | null;
  songId: string | null;
};

type DefaultTInsert<T extends Record<string, unknown>> = Pick<T, 'id'> &
  Partial<Omit<T, 'createdAt' | 'updatedAt'>>;
type DefaultTUpdate<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

declare module 'knex/types/tables' {
  interface Tables {
    users: Knex.CompositeTableType<
      UserRow,
      DefaultTInsert<UserRow>,
      DefaultTUpdate<UserRow>
    >;
    invitations: Knex.CompositeTableType<
      InvitationRow,
      Pick<InvitationRow, 'code' | 'expiresAt'> &
        Partial<Omit<InvitationRow, 'id' | 'createdAt' | 'updatedAt'>>,
      Partial<Omit<InvitationRow, 'id'>>
    >;
    albums: Knex.CompositeTableType<
      AlbumRow,
      DefaultTInsert<AlbumRow>,
      DefaultTUpdate<AlbumRow>
    >;
    artists: Knex.CompositeTableType<
      ArtistRow,
      DefaultTInsert<ArtistRow>,
      DefaultTUpdate<ArtistRow>
    >;
    audio_files: Knex.CompositeTableType<
      AudioFileRow,
      AudioFileRow,
      Partial<Pick<AudioFileRow, 'lastModified' | 'filesize'>>
    >;
    songs: Knex.CompositeTableType<
      SongRow,
      Pick<
        SongRow,
        'id' | 'albumId' | 'artistId' | 'fileId' | 'title' | 'duration'
      > &
        Partial<SongRow>,
      DefaultTUpdate<SongRow>
    >;
    media_folders: Knex.CompositeTableType<
      MediaFolderRow,
      Pick<MediaFolderRow, 'id' | 'path'> &
        Partial<Pick<MediaFolderRow, 'enabled'>>,
      Partial<Omit<MediaFolderRow, 'id'>>
    >;
    sessions: SessionRow;
    search_history: Knex.CompositeTableType<
      SearchHistoryRow,
      Pick<SearchHistoryRow, 'id' | 'userId'> & Partial<SearchHistoryRow>
    >;
  }
}

declare module 'knex/types/result' {
  interface Registry {
    Count: number;
  }
}
