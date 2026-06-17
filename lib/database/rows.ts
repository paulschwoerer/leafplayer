import { FileFormat } from '../scanner/types.ts';

type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

export type WithoutTimestamps<T> = Omit<T, keyof Timestamps>;

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
