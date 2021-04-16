import {
  throwNotImplemented,
  throwNotImplementedPromise,
} from 'helpers/context';
import { FullSong } from 'leafplayer-common';
import { createContext } from 'react';
import { AddToQueueOptions, PlayerRepeatMode, QueueItem } from './types';

export type PlayerContextState = {
  isPlaying: boolean;
  seek: number;
  volume: number;
  shuffle: boolean;
  isMuted: boolean;
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  queue: QueueItem[];
  current: QueueItem | null;
  history: QueueItem[];
  repeatMode: PlayerRepeatMode;
  bufferedTo: number;
};

export type PlayerContextActions = {
  skipNext: () => void;
  skipPrevious: () => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setSeek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: PlayerRepeatMode) => void;
  addSongsToQueue: (songs: FullSong[], options?: AddToQueueOptions) => void;
  addAlbumToQueue: (
    albumId: string,
    options?: AddToQueueOptions,
  ) => Promise<void>;
  addArtistToQueue: (
    artistId: string,
    options?: AddToQueueOptions,
  ) => Promise<void>;
  goToQueueIndex: (index: number) => void;
  setShuffle: (shuffle: boolean) => void;
  playNext: (items: FullSong[]) => void;
  removeQueueItem: (index: number) => void;
};

export const PlayerContext = createContext<
  [PlayerContextState, PlayerContextActions]
>([
  {
    queue: [],
    current: null,
    history: [],
    canSkipNext: false,
    canSkipPrevious: false,
    isPlaying: false,
    seek: 0,
    volume: 0,
    shuffle: false,
    isMuted: false,
    repeatMode: PlayerRepeatMode.DISABLED,
    bufferedTo: 0,
  },
  {
    addArtistToQueue: throwNotImplementedPromise,
    addAlbumToQueue: throwNotImplementedPromise,
    addSongsToQueue: throwNotImplemented,
    goToQueueIndex: throwNotImplemented,
    setRepeatMode: throwNotImplemented,
    skipNext: throwNotImplemented,
    skipPrevious: throwNotImplemented,
    play: throwNotImplementedPromise,
    pause: throwNotImplemented,
    togglePlayPause: throwNotImplemented,
    setSeek: throwNotImplemented,
    setVolume: throwNotImplemented,
    toggleMute: throwNotImplemented,
    setShuffle: throwNotImplemented,
    playNext: throwNotImplemented,
    removeQueueItem: throwNotImplemented,
  },
]);
