type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

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
} & Timestamps;

export type PartialArtist = {
  id: string;
  name: string;
};

export type FullArtist = PartialArtist & {
  albumCount: number;
  songCount: number;
} & Timestamps;

export type PartialAlbum = {
  id: string;
  name: string;
};

export type FullAlbum = PartialAlbum & {
  year?: number;
  artist: PartialArtist;
} & Timestamps;

export type User = {
  id: string;
  username: string;
  displayName: string;
};

export type UserSession = {
  id: string;
  userId: string;
  browser: string;
  os: string;
  lastUsedAt: number;
};
