import { PlayerRepeatMode, QueueItem } from '../types';

export type PlayerPersistState = {
  queue: QueueItem[];
  history: QueueItem[];
  current: QueueItem | null;
  settings: {
    volume: number;
    isMuted: boolean;
    shuffle: boolean;
    repeatMode: PlayerRepeatMode;
  };
};

export interface PlayerPersistor {
  persist(state: PlayerPersistState): Promise<void>;
  retrieve(): Promise<PlayerPersistState | null>;
  clear(): Promise<void>;
}
