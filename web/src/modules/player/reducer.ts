import { clamp } from 'helpers/math';
import { randomArrayIndex } from 'helpers/random';
import { PlayerRepeatMode, QueueItem } from './types';

const PREVIOUS_SKIP_THRESHOLD = 5;

export enum PlaybackState {
  NONE = 'none',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LOADING = 'loading',
  READY = 'ready',
  SONG_ENDED = 'song_ended',
  QUEUE_ENDED = 'queue_ended',
  ERROR = 'error',
}

type State = {
  playbackState: PlaybackState;
  queue: QueueItem[];
  current: QueueItem | null;
  history: QueueItem[];
  seek: number;
  shouldPlayOnceReady: boolean;
  volume: number;
  shuffle: boolean;
  isMuted: boolean;
  hasPassedSkipThreshold: boolean;
  repeatMode: PlayerRepeatMode;
  bufferedTo: number;
};

export const initialState: State = {
  playbackState: PlaybackState.NONE,
  queue: [],
  history: [],
  current: null,
  seek: 0,
  shuffle: false,
  shouldPlayOnceReady: false,
  volume: 1,
  isMuted: false,
  hasPassedSkipThreshold: false,
  repeatMode: PlayerRepeatMode.DISABLED,
  bufferedTo: 0,
};

type Action =
  | { type: 'playbackStarted' }
  | { type: 'playbackPaused' }
  | { type: 'playbackEnded' }
  | { type: 'setIsReadyToPlay' }
  | { type: 'setIsLoading' }
  | { type: 'skipPrevious' }
  | { type: 'skipNext' }
  | { type: 'setSeek'; time: number }
  | { type: 'setVolume'; volume: number }
  | { type: 'setIsMuted'; isMuted: boolean }
  | { type: 'setShuffle'; shuffle: boolean }
  | { type: 'setRepeatMode'; repeatMode: PlayerRepeatMode }
  | {
      type: 'addToQueue';
      items: QueueItem[];
      replace?: boolean;
      startPlaying?: boolean;
    }
  | { type: 'playNext'; items: QueueItem[] }
  | { type: 'removeQueueItem'; index: number }
  | { type: 'goToQueueIndex'; index: number }
  | { type: 'playbackError' }
  | { type: 'setBuffered'; to: number };

export function playerReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'playbackStarted': {
      return {
        ...state,
        playbackState: PlaybackState.PLAYING,
        shouldPlayOnceReady: true,
      };
    }
    case 'playbackPaused': {
      return {
        ...state,
        playbackState: PlaybackState.PAUSED,
        shouldPlayOnceReady: false,
      };
    }
    case 'playbackEnded':
      return handlePlayBackEnded(state);
    case 'setIsReadyToPlay': {
      return {
        ...state,
        playbackState: PlaybackState.READY,
      };
    }
    case 'setIsLoading': {
      return {
        ...state,
        playbackState: PlaybackState.LOADING,
        seek: 0,
      };
    }
    case 'skipNext':
      return handleSkipNextAction(state);
    case 'skipPrevious':
      return handleSkipPreviousAction(state);
    case 'setSeek': {
      const { time } = action;

      return {
        ...state,
        seek: time,
        hasPassedSkipThreshold: time > PREVIOUS_SKIP_THRESHOLD,
      };
    }
    case 'setVolume': {
      const { volume } = action;

      return {
        ...state,
        volume: clamp(volume, 0, 1),
        isMuted: false,
      };
    }
    case 'setIsMuted': {
      const { isMuted } = action;

      return {
        ...state,
        isMuted,
      };
    }
    case 'setShuffle': {
      const { shuffle } = action;

      return {
        ...state,
        shuffle,
      };
    }
    case 'setRepeatMode': {
      const { repeatMode } = action;

      return {
        ...state,
        repeatMode,
      };
    }
    case 'addToQueue': {
      const { items, replace = true, startPlaying = false } = action;

      if (items.length === 0) {
        return {
          ...state,
          current: null,
          queue: [],
          history: [],
        };
      }

      if (replace) {
        return {
          ...state,
          current: items[0],
          queue: items.slice(1),
          history: [],
          shouldPlayOnceReady: startPlaying,
        };
      }

      return {
        ...state,
        queue: [...state.queue, ...items],
        shouldPlayOnceReady: startPlaying,
      };
    }
    case 'playNext': {
      const { items } = action;

      return {
        ...state,
        queue: [...items, ...state.queue],
      };
    }
    case 'removeQueueItem': {
      const { index } = action;
      const { queue } = state;

      return {
        ...state,
        queue: [...queue.slice(0, index), ...queue.slice(index + 1)],
      };
    }
    case 'goToQueueIndex': {
      const { index } = action;
      const { queue, history, current } = state;

      if (!current) {
        return state;
      }

      return {
        ...state,
        history: [...history, current],
        current: queue[index],
        queue: queue.slice(index + 1),
        shouldPlayOnceReady: true,
      };
    }
    case 'playbackError': {
      return {
        ...state,
        playbackState: PlaybackState.ERROR,
      };
    }
    case 'setBuffered': {
      const { to } = action;

      return {
        ...state,
        bufferedTo: to,
      };
    }
  }
}

function handlePlayBackEnded(state: State): State {
  const shouldRepeatItem =
    state.repeatMode === PlayerRepeatMode.ONE ||
    (state.repeatMode === PlayerRepeatMode.ALL &&
      state.queue.length === 0 &&
      state.history.length === 0);

  if (state.current === null) {
    return state;
  }

  if (shouldRepeatItem) {
    return {
      ...state,
      seek: 0,
      playbackState: PlaybackState.READY,
      shouldPlayOnceReady: true,
    };
  }

  if (state.queue.length === 0) {
    if (state.repeatMode === PlayerRepeatMode.ALL) {
      return {
        ...state,
        history: [],
        current: state.history[0],
        queue: [...state.history.slice(1), state.current],
      };
    }

    return {
      ...state,
      playbackState: PlaybackState.QUEUE_ENDED,
    };
  }

  return {
    ...state,
    current: state.queue[0],
    queue: state.queue.slice(1),
    history: [...state.history, state.current],
    playbackState: PlaybackState.SONG_ENDED,
    shouldPlayOnceReady: true,
  };
}

function handleSkipNextAction(state: State): State {
  if (state.current === null) {
    return state;
  }

  const commonState = {
    seek: 0,
    bufferedTo: 0,
    hasPassedSkipThreshold: false,
  };

  if (state.queue.length === 0) {
    if (state.history.length > 0 && state.repeatMode === PlayerRepeatMode.ALL) {
      return {
        ...state,
        ...commonState,
        current: state.history[0],
        history: [],
        queue: [...state.history.slice(1), state.current],
      };
    }

    return state;
  }

  if (state.shuffle) {
    const randomIndex = randomArrayIndex(state.queue.length);

    return {
      ...state,
      ...commonState,
      current: state.queue[randomIndex],
      history: [...state.history, state.current],
      queue: [
        ...state.queue.slice(0, randomIndex),
        ...state.queue.slice(randomIndex + 1),
      ],
    };
  }

  return {
    ...state,
    ...commonState,
    current: state.queue[0],
    history: [...state.history, state.current],
    queue: state.queue.slice(1),
  };
}

function handleSkipPreviousAction(state: State): State {
  if (state.current === null) {
    return state;
  }

  const commonState = {
    seek: 0,
    bufferedTo: 0,
    hasPassedSkipThreshold: false,
  };

  if (state.history.length === 0) {
    if (state.queue.length > 0 && state.repeatMode === PlayerRepeatMode.ALL) {
      const lastQueueIndex = state.queue.length - 1;

      return {
        ...state,
        ...commonState,
        current: state.queue[lastQueueIndex],
        queue: [state.current, ...state.queue.slice(0, lastQueueIndex)],
      };
    }

    return state;
  }

  const lastHistoryIndex = state.history.length - 1;

  return {
    ...state,
    ...commonState,
    queue: [state.current, ...state.queue],
    current: state.history[lastHistoryIndex],
    history: state.history.slice(0, lastHistoryIndex),
  };
}
