import { PlayerRepeatMode, QueueItem } from 'modules/player/types';
import { initialState, playerReducer, PlaybackState } from './reducer';

function qi(id: string): QueueItem {
  return {
    song: {
      id,
      title: 'Test song',
      duration: 42,
      track: 0,
      disk: 1,
      createdAt: '2000-12-24 17:00:00',
      updatedAt: '2000-12-24 17:00:00',
      album: {
        id: 'albumId',
        name: 'Album Name',
      },
      artist: {
        id: 'artistId',
        name: 'Artist Name',
      },
    },
  };
}

describe('player reducer', () => {
  describe('when calling playbackStarted action', () => {
    it('should set playbackState to PLAYING', () => {
      const newState = playerReducer(initialState, {
        type: 'playbackStarted',
      });

      expect(newState).toStrictEqual({
        ...initialState,
        playbackState: PlaybackState.PLAYING,
        shouldPlayOnceReady: true,
      });
    });
  });

  describe('when calling playbackPaused action', () => {
    it('should set playbackState to PAUSED', () => {
      const newState = playerReducer(initialState, {
        type: 'playbackPaused',
      });

      expect(newState).toStrictEqual({
        ...initialState,
        playbackState: PlaybackState.PAUSED,
        shouldPlayOnceReady: false,
      });
    });
  });

  describe('when calling playbackEnded action', () => {
    it('should take next song from queue and set history and playback state accordingly', () => {
      const newState = playerReducer(
        {
          ...initialState,
          current: qi('current'),
          queue: [qi('queue2'), qi('queue3')],
        },
        {
          type: 'playbackEnded',
        },
      );

      expect(newState).toStrictEqual({
        ...initialState,
        history: [qi('current')],
        queue: [qi('queue3')],
        current: qi('queue2'),
        playbackState: PlaybackState.SONG_ENDED,
        shouldPlayOnceReady: true,
      });
    });

    it('should end queue playback when no more songs are in queue and repeat is disabled', () => {
      const state = {
        ...initialState,
        current: qi('item1'),
        queue: [],
      };

      const newState = playerReducer(state, {
        type: 'playbackEnded',
      });

      expect(newState).toStrictEqual({
        ...state,
        playbackState: PlaybackState.QUEUE_ENDED,
      });
    });

    it('should load history and current as new queue, when at end of queue and repeat mode is all', () => {
      const state = {
        ...initialState,
        queue: [],
        current: qi('item1'),
        history: [qi('item2'), qi('item3')],
        repeatMode: PlayerRepeatMode.ALL,
      };

      const newState = playerReducer(state, {
        type: 'playbackEnded',
      });

      expect(newState).toStrictEqual({
        ...state,
        history: [],
        current: qi('item2'),
        queue: [qi('item3'), qi('item1')],
      });
    });

    it('should seek to beginning of song when repeat mode is set to repeat one', () => {
      const state = {
        ...initialState,
        current: qi('item1'),
        queue: [qi('queue1')],
        seek: 42,
        repeatMode: PlayerRepeatMode.ONE,
      };

      const newState = playerReducer(state, {
        type: 'playbackEnded',
      });

      expect(newState).toStrictEqual({
        ...state,
        seek: 0,
        playbackState: PlaybackState.READY,
        shouldPlayOnceReady: true,
      });
    });

    it('should seek to beginning of song when queue and history are empty and repeat mode is set to all', () => {
      const state = {
        ...initialState,
        current: qi('item1'),
        seek: 42,
        repeatMode: PlayerRepeatMode.ALL,
      };

      const newState = playerReducer(state, {
        type: 'playbackEnded',
      });

      expect(newState).toStrictEqual({
        ...state,
        seek: 0,
        playbackState: PlaybackState.READY,
        shouldPlayOnceReady: true,
      });
    });
  });

  describe('when calling skipNext action', () => {
    it('should reset seek, buffered and hasPassedSkipThreshold attributes', () => {
      const state = {
        ...initialState,
        current: qi('current'),
        queue: [qi('queue1')],
        hasPassedSkipThreshold: true,
        seek: 10,
        bufferedTo: 11,
      };

      const newState = playerReducer(state, {
        type: 'skipNext',
      });

      expect(newState.hasPassedSkipThreshold).toEqual(false);
      expect(newState.seek).toEqual(0);
      expect(newState.bufferedTo).toEqual(0);
    });

    it('should set next item in queue as current, remove it and put the current at the end of history', () => {
      const state = {
        ...initialState,
        current: qi('current'),
        queue: [qi('queue1'), qi('queue2')],
        history: [qi('history1')],
      };

      const newState = playerReducer(state, {
        type: 'skipNext',
      });

      expect(newState.current).toStrictEqual(qi('queue1'));
      expect(newState.queue).toStrictEqual([qi('queue2')]);
      expect(newState.history).toStrictEqual([qi('history1'), qi('current')]);
    });

    it('should not do anything when at end of queue', () => {
      const state = {
        ...initialState,
        queue: [],
        current: qi('current'),
      };

      const newState = playerReducer(state, {
        type: 'skipNext',
      });

      expect(newState).toStrictEqual(state);
    });

    it('should empty history and load it together with current as new queue, when at end of queue and repeat mode is all', () => {
      const state = {
        ...initialState,
        queue: [],
        current: qi('current'),
        history: [qi('history1'), qi('history2')],
        repeatMode: PlayerRepeatMode.ALL,
      };

      const newState = playerReducer(state, {
        type: 'skipNext',
      });

      expect(newState).toStrictEqual({
        ...state,
        history: [],
        current: qi('history1'),
        queue: [qi('history2'), qi('current')],
      });
    });
  });

  describe('when calling skipPrevious action', () => {
    it('should reset seek, buffered and hasPassedSkipThreshold attributes', () => {
      const state = {
        ...initialState,
        current: qi('current'),
        history: [qi('history1')],
        hasPassedSkipThreshold: true,
        seek: 10,
        bufferedTo: 11,
      };

      const newState = playerReducer(state, {
        type: 'skipPrevious',
      });

      expect(newState.hasPassedSkipThreshold).toEqual(false);
      expect(newState.seek).toEqual(0);
      expect(newState.bufferedTo).toEqual(0);
    });

    it('should skip to last item in history and add current to queue', () => {
      const state = {
        ...initialState,
        queue: [qi('queue1')],
        current: qi('current'),
        history: [qi('history1'), qi('history2')],
      };

      const newState = playerReducer(state, {
        type: 'skipPrevious',
      });

      expect(newState).toStrictEqual({
        ...state,
        queue: [qi('current'), qi('queue1')],
        current: qi('history2'),
        history: [qi('history1')],
      });
    });

    it('should not do anything, when history is empty', () => {
      const state = {
        ...initialState,
        history: [],
        current: qi('current'),
      };

      const newState = playerReducer(state, {
        type: 'skipPrevious',
      });

      expect(newState).toStrictEqual(state);
    });

    it('should skip to last item in queue, when history is empty and repeat mode is all', () => {
      const state = {
        ...initialState,
        history: [],
        current: qi('current'),
        queue: [qi('queue1'), qi('queue2')],
        repeatMode: PlayerRepeatMode.ALL,
      };

      const newState = playerReducer(state, {
        type: 'skipPrevious',
      });

      expect(newState).toStrictEqual({
        ...state,
        current: qi('queue2'),
        queue: [qi('current'), qi('queue1')],
      });
    });
  });

  describe('when calling setSeek action', () => {
    it('should set seek accordingly and calculate if the playback has passed the skip threshold', () => {
      const newState = playerReducer(initialState, {
        type: 'setSeek',
        time: 42,
      });

      expect(newState).toStrictEqual({
        ...initialState,
        seek: 42,
        hasPassedSkipThreshold: true,
      });
    });
  });

  describe('when calling setVolume action', () => {
    it('should set volume accordingly and disable mute', () => {
      const state = {
        ...initialState,
        isMuted: true,
      };

      const newState = playerReducer(state, {
        type: 'setVolume',
        volume: 0.75,
      });

      expect(newState).toStrictEqual({
        ...state,
        volume: 0.75,
        isMuted: false,
      });
    });
  });

  describe('when calling setIsMuted action', () => {
    it('should set isMuted accordingly', () => {
      const newState = playerReducer(initialState, {
        type: 'setIsMuted',
        isMuted: true,
      });

      expect(newState).toStrictEqual({
        ...initialState,
        isMuted: true,
      });
    });
  });

  describe('when calling setIsLoading action', () => {
    it('should set playback state to loading and reset seek', () => {
      const state = {
        ...initialState,
        seek: 10,
      };

      const newState = playerReducer(state, {
        type: 'setIsLoading',
      });

      expect(newState).toStrictEqual({
        ...initialState,
        playbackState: PlaybackState.LOADING,
        seek: 0,
      });
    });
  });

  describe('when calling setShuffle action', () => {
    it('should set shuffle attribute', () => {
      const state = {
        ...initialState,
        shuffle: false,
      };

      const newState = playerReducer(state, {
        type: 'setShuffle',
        shuffle: true,
      });

      expect(newState).toStrictEqual({
        ...state,
        shuffle: true,
      });
    });
  });

  describe('when calling setRepeatMode', () => {
    it('should set repeatMode accordingly', () => {
      const newState = playerReducer(initialState, {
        type: 'setRepeatMode',
        repeatMode: PlayerRepeatMode.ONE,
      });

      expect(newState).toStrictEqual({
        ...initialState,
        repeatMode: PlayerRepeatMode.ONE,
      });
    });
  });

  describe('when calling addToQueue action', () => {
    it('should replace queue and history when replacing is enabled', () => {
      const state = {
        ...initialState,
        history: [qi('history1')],
        current: qi('current'),
        queue: [qi('queue1')],
      };

      const newState = playerReducer(state, {
        type: 'addToQueue',
        items: [qi('new1'), qi('new2'), qi('new3')],
        replace: true,
      });

      expect(newState).toStrictEqual({
        ...state,
        queue: [qi('new2'), qi('new3')],
        current: qi('new1'),
        history: [],
      });
    });

    it('should add items to end of queue when replacing is disabled', () => {
      const state = {
        ...initialState,
        history: [qi('history1')],
        current: qi('current'),
        queue: [qi('queue1'), qi('queue2')],
      };

      const newState = playerReducer(state, {
        type: 'addToQueue',
        items: [qi('new1'), qi('new2')],
        replace: false,
      });

      expect(newState).toStrictEqual({
        ...state,
        queue: [qi('queue1'), qi('queue2'), qi('new1'), qi('new2')],
      });
    });
  });

  describe('when calling playNext action', () => {
    it('should add items at beginning of queue', () => {
      const state = {
        ...initialState,
        queue: [qi('queue1')],
      };

      const newState = playerReducer(state, {
        type: 'playNext',
        items: [qi('new1'), qi('new2')],
      });

      expect(newState).toStrictEqual({
        ...state,
        queue: [qi('new1'), qi('new2'), qi('queue1')],
      });
    });
  });

  describe('when calling playbackError action', () => {
    it('should set the playback state to playbackError', () => {
      const newState = playerReducer(initialState, {
        type: 'playbackError',
      });

      expect(newState).toStrictEqual({
        ...initialState,
        playbackState: PlaybackState.ERROR,
      });
    });
  });

  describe('when calling removeQueueItem action', () => {
    it('should remove the specified queue item', () => {
      const state = {
        ...initialState,
        queue: [qi('queue1'), qi('queue2'), qi('queue3')],
      };

      const newState = playerReducer(state, {
        type: 'removeQueueItem',
        index: 1,
      });

      expect(newState).toStrictEqual({
        ...state,
        queue: [qi('queue1'), qi('queue3')],
      });
    });
  });

  describe('when calling goToQueueIndex action', () => {
    it('should go to the specified index and set shouldPlayOnceReady', () => {
      const state = {
        ...initialState,
        history: [qi('history1')],
        current: qi('current'),
        queue: [qi('queue1'), qi('queue2'), qi('queue3')],
      };

      const newState = playerReducer(state, {
        type: 'goToQueueIndex',
        index: 1,
      });

      expect(newState).toStrictEqual({
        ...state,
        history: [qi('history1'), qi('current')],
        current: qi('queue2'),
        queue: [qi('queue3')],
        shouldPlayOnceReady: true,
      });
    });
  });
});
