import Knex from 'knex';
import { FileFormat } from '../scanner/types';

export type UserRow = {
  id: string;
  username: string;
  displayName: string;
  password: string;
};

export type InvitationRow = {
  id: number;
  code: string;
  used: boolean;
  expiresAt: number;
  comment: string | null;
};

export type AlbumRow = {
  id: string;
  artistId: string;
  name: string;
  year: number | null;
};

export type ArtistRow = {
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

export type SongRow = {
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

declare module 'knex/types/tables' {
  interface Tables {
    users: Knex.CompositeTableType<
      UserRow,
      UserRow & Partial<Pick<UserRow, 'displayName'>>,
      Partial<Omit<UserRow, 'id'>>
    >;
    invitations: Knex.CompositeTableType<
      InvitationRow,
      Pick<InvitationRow, 'code' | 'expiresAt'> &
        Partial<Pick<InvitationRow, 'comment' | 'used'>>,
      Partial<Omit<InvitationRow, 'id'>>
    >;
    albums: Knex.CompositeTableType<AlbumRow, AlbumRow, never>;
    artists: Knex.CompositeTableType<ArtistRow, ArtistRow, never>;
    audio_files: Knex.CompositeTableType<
      AudioFileRow,
      AudioFileRow,
      Partial<Pick<AudioFileRow, 'lastModified' | 'filesize'>>
    >;
    songs: Knex.CompositeTableType<
      SongRow,
      SongRow,
      Partial<Omit<SongRow, 'id'>>
    >;
    media_folders: Knex.CompositeTableType<
      MediaFolderRow,
      Pick<MediaFolderRow, 'id' | 'path'> &
        Partial<Pick<MediaFolderRow, 'enabled'>>,
      Partial<Omit<MediaFolderRow, 'id'>>
    >;
    sessions: SessionRow;
  }
}

declare module 'knex/types/result' {
  interface Registry {
    Count: number;
  }
}
