export type PartialSong = {
  id: string;
  title: string;
};

export type FullSong = PartialSong & {
  duration: number;
  track?: number;
  disk: number;
  artist: PartialArtist;
  album: PartialAlbum;
};

export type PartialArtist = {
  id: string;
  name: string;
};

export type FullArtist = PartialArtist & {
  albumCount: number;
  songCount: number;
};

export type PartialAlbum = {
  id: string;
  name: string;
};

export type FullAlbum = PartialAlbum & {
  year?: number;
  artist: PartialArtist;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
};

export type UserSession = {
  id: string;
  browser: string;
  os: string;
  lastUsedAt: number;
};
