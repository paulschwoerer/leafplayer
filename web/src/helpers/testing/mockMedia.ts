import { FullArtist, FullAlbum, FullSong } from 'leafplayer-common';

export function mockArtist(name: string): FullArtist {
  return {
    id: `${Math.random()}`,
    name,
    albumCount: 1,
    songCount: 10,
    createdAt: '2013-01-01 11:12:13',
    updatedAt: '2013-01-02 12:12:12',
  };
}

export function mockAlbum(name: string): FullAlbum {
  return {
    id: `${Math.random()}`,
    name,
    year: 2012,
    artist: {
      id: `${Math.random()}`,
      name: 'Unknown Artist',
    },
    createdAt: '2013-01-01 11:12:13',
    updatedAt: '2013-01-02 12:12:12',
  };
}

export function mockSong(title: string): FullSong {
  return {
    id: `${Math.random()}`,
    title,
    disk: 1,
    duration: 123,
    track: 1,
    album: {
      id: `${Math.random()}`,
      name: 'Unknown Album',
    },
    artist: {
      id: `${Math.random()}`,
      name: 'Unknown Artist',
    },
    createdAt: '2013-01-01 11:12:13',
    updatedAt: '2013-01-02 12:12:12',
  };
}
