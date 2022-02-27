import {
  FullAlbum,
  FullSong,
  FullArtist,
  User,
  UserSession,
  SearchHistoryEntry,
  SearchResults,
} from './entities';

export type AlbumResponseDto = {
  album: FullAlbum;
};

export type AlbumWithSongsResponseDto = AlbumResponseDto & {
  songs: FullSong[];
};

export type AlbumsResponseDto = {
  albums: FullAlbum[];
};

export type ArtistResponseDto = {
  artist: FullArtist;
};

export type ArtistWithAlbumsResponseDto = ArtistResponseDto & {
  albums: AlbumWithSongsResponseDto[];
  appearsOn: FullAlbum[];
};

export type ArtistsResponseDto = {
  artists: FullArtist[];
};

export type AuthRequestDto = {
  username: string;
  password: string;
  stayLoggedIn?: boolean;
};

export type AuthResponseDto = {
  user: User;
  artworkToken: string;
};

export type RegisterRequestDto = {
  inviteCode: string;
  username: string;
  displayName?: string;
  password: string;
};

export type ChangePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
};

export type UserResponseDto = {
  user: User;
  artworkToken: string;
};

export type SongsResponseDto = {
  songs: FullSong[];
};

export type UserSessionsResponseDto = {
  sessions: UserSession[];
  currentSessionId: string;
};

export type SearchResponseDto = {
  results: SearchResults;
};

export type RevokeSessionRequestDto = {
  currentPassword: string;
};

export type CreateSearchHistoryEntryRequestDto = {
  forType: 'album' | 'artist' | 'song';
  forId: string;
};

export type CreateSearchHistoryEntryResponseDto = {
  entry: SearchHistoryEntry;
};

export type FindSearchHistoryEntriesResponseDto = {
  entries: SearchHistoryEntry[];
};
