import { FullAlbum, FullSong, FullArtist, User, UserSession } from './entities';

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
  results: {
    artists: FullArtist[];
    albums: FullAlbum[];
    songs: FullSong[];
  };
};

export type RevokeSessionRequestDto = {
  currentPassword: string;
};
