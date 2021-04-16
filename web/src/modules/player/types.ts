import { FullSong } from 'leafplayer-common';

export enum PlayerRepeatMode {
  DISABLED = 'disabled',
  ALL = 'all',
  ONE = 'one',
}

export type QueueItem = {
  song: FullSong;
};

export type AddToQueueOptions = {
  startPlaying?: boolean;
  replaceQueue?: boolean;
};
