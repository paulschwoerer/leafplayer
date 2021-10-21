import { FullSong } from 'leafplayer-common';
import { AuthContext } from 'modules/auth';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { PlayerContext } from './context';
import { buildStreamUrl, computeBuffered, computeIsPlaying } from './helpers';
import {
  addMediaSessionListeners,
  removeMediaSessionListeners,
  updateMediaSessionMetaData,
  updateMediaSessionPlayState,
  updateMediaSessionPositionState,
} from './mediaSession';
import { LocalStoragePlayerPersistor } from './persistence/LocalStoragePlayerPersistor';
import {
  loadAlbumSongsFromAPI,
  loadArtistSongsFromAPI,
  songsToQueueItems,
} from './queue';
import { initialState, PlaybackState, playerReducer } from './reducer';
import {
  registerKeyboardShortcuts,
  unregisterKeyboardShortcuts,
} from './shortcuts';
import { AddToQueueOptions, PlayerRepeatMode } from './types';

export function PlayerProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { showNotification } = useContext(NotificationContext);
  const { artworkToken } = useContext(AuthContext);

  const [
    {
      playbackState,
      isMuted,
      seek,
      shouldPlayOnceReady,
      volume,
      hasPassedSkipThreshold,
      queue,
      current,
      history,
      repeatMode,
      shuffle,
      bufferedTo,
    },
    dispatch,
  ] = useReducer(playerReducer, initialState);

  const canSkipNext = useMemo(
    () =>
      queue.length > 0 ||
      (history.length > 0 && repeatMode === PlayerRepeatMode.ALL),
    [queue, history, repeatMode],
  );
  const canSkipPrevious = useMemo(
    () =>
      history.length > 0 ||
      hasPassedSkipThreshold ||
      (queue.length > 0 && repeatMode === PlayerRepeatMode.ALL),
    [queue, history, hasPassedSkipThreshold, repeatMode],
  );

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        dispatch({ type: 'playbackError' });
        showNotification({
          title: 'Cannot play song',
          message: e.message,
          type: 'error',
        });
      });
    }
  }, [showNotification]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback((): void => {
    switch (playbackState) {
      case PlaybackState.PLAYING:
        return pause();
      case PlaybackState.READY:
      case PlaybackState.PAUSED:
        return play();
      case PlaybackState.QUEUE_ENDED:
        dispatch({ type: 'setSeek', time: 0 });
        return play();
      default:
        console.warn(
          `[Player::togglePlayPause] not in a state where this method should be called (state=${playbackState})`,
        );
    }
  }, [playbackState, play, pause]);

  function setShuffle(shuffle: boolean) {
    dispatch({ type: 'setShuffle', shuffle });
  }

  function addSongsToQueue(
    songs: FullSong[],
    options?: AddToQueueOptions,
  ): void {
    dispatch({
      type: 'addToQueue',
      items: songsToQueueItems(songs),
      replace: options?.replaceQueue,
      startPlaying: options?.startPlaying,
    });
  }

  function playNext(songs: FullSong[]): void {
    dispatch({
      type: 'playNext',
      items: songsToQueueItems(songs),
    });
  }

  async function addAlbumToQueue(
    albumId: string,
    options?: AddToQueueOptions,
  ): Promise<void> {
    try {
      const songs = await loadAlbumSongsFromAPI(albumId);

      addSongsToQueue(songs, options);
    } catch (e) {
      showNotification({
        title: 'Cannot add album to queue',
        message: e.message,
        type: 'error',
      });
    }
  }

  async function addArtistToQueue(
    artistId: string,
    options?: AddToQueueOptions,
  ): Promise<void> {
    try {
      const songs = await loadArtistSongsFromAPI(artistId);

      addSongsToQueue(songs, options);
    } catch (e) {
      showNotification({
        title: 'Cannot add artist to queue',
        message: e.message,
        type: 'error',
      });
    }
  }

  const setSeek = useCallback((time: number) => {
    if (audioRef.current) {
      dispatch({ type: 'setSeek', time });
      audioRef.current.currentTime = time;
    }
  }, []);

  function setVolume(volume: number) {
    if (audioRef.current) {
      dispatch({ type: 'setVolume', volume });
      audioRef.current.volume = volume;
    }
  }

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
      dispatch({ type: 'setIsMuted', isMuted: !isMuted });
    }
  }, [isMuted, volume]);

  function setRepeatMode(mode: PlayerRepeatMode) {
    dispatch({ type: 'setRepeatMode', repeatMode: mode });
  }

  function removeQueueItem(index: number) {
    dispatch({ type: 'removeQueueItem', index });
  }

  function goToQueueIndex(index: number) {
    dispatch({ type: 'goToQueueIndex', index });
  }

  const skipNext = useCallback(() => {
    if (canSkipNext) {
      dispatch({ type: 'skipNext' });
    }
  }, [canSkipNext]);

  const skipPrevious = useCallback(() => {
    if (hasPassedSkipThreshold) {
      setSeek(0);
    } else if (canSkipPrevious) {
      dispatch({ type: 'skipPrevious' });
    }
  }, [canSkipPrevious, hasPassedSkipThreshold, setSeek]);

  useEffect(() => {
    const persistor = new LocalStoragePlayerPersistor();

    persistor
      .retrieve()
      .then(state => {
        if (state !== null) {
          dispatch({
            type: 'setState',
            state: {
              ...state,
              ...state.settings,
            },
          });

          if (audioRef.current) {
            audioRef.current.volume = state.settings.isMuted
              ? 0
              : state.settings.volume;
          }
        }
      })
      .catch(e =>
        console.error(`could not retrieve persisted player state: ${e}`),
      );
  }, []);

  useEffect(() => {
    const persistor = new LocalStoragePlayerPersistor();

    window.onbeforeunload = () => {
      persistor
        .persist({
          current,
          history,
          queue,
          settings: {
            isMuted,
            repeatMode,
            shuffle,
            volume,
          },
        })
        .catch(e => `could not persist player state: ${e}`);
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, [current, history, isMuted, queue, repeatMode, shuffle, volume]);

  useEffect(() => {
    updateMediaSessionPlayState(playbackState);
  }, [playbackState]);

  useEffect(() => {
    updateMediaSessionMetaData(current, artworkToken);
  }, [current, artworkToken]);

  // clean up effect
  useEffect(() => {
    return () => {
      updateMediaSessionPlayState(PlaybackState.NONE);
      updateMediaSessionMetaData(null, null);
      updateMediaSessionPositionState(undefined);
    };
  }, []);

  useEffect(() => console.debug(`[Player] STATE: ${playbackState}`), [
    playbackState,
  ]);

  useEffect(() => {
    if (playbackState !== PlaybackState.READY) {
      return;
    }

    if (shouldPlayOnceReady) {
      play();
    } else {
      dispatch({ type: 'playbackPaused' });
    }
  }, [playbackState, shouldPlayOnceReady, play]);

  useEffect(() => {
    addMediaSessionListeners({
      play,
      pause,
      skipNext,
      skipPrevious,
      seekTo: setSeek,
    });

    return () => removeMediaSessionListeners();
  }, [play, pause, skipNext, skipPrevious, setSeek]);

  useEffect(() => {
    registerKeyboardShortcuts({
      skipNext,
      skipPrevious,
      toggleMute,
      togglePlayPause,
      toggleShuffle: () => setShuffle(!shuffle),
    });

    return () => unregisterKeyboardShortcuts();
  }, [shuffle, skipNext, skipPrevious, toggleMute, togglePlayPause]);

  useEffect(() => {
    const audioEl = audioRef.current;

    if (!audioEl) {
      return;
    }

    function onPlaying() {
      console.debug('[Player] event: playing');
      dispatch({ type: 'playbackStarted' });
    }
    function onPause() {
      console.debug('[Player] event: pause');
      dispatch({ type: 'playbackPaused' });
    }
    function onLoadStart() {
      console.debug('[Player] event: loadstart');
      dispatch({ type: 'setIsLoading' });
    }
    function onLoadedMetadata() {
      console.debug('[Player] event: canplay');
      dispatch({ type: 'setIsReadyToPlay' });
    }
    function onEnded() {
      console.debug('[Player] event: ended');
      dispatch({ type: 'playbackEnded' });
    }
    function onTimeUpdate() {
      const position = audioRef.current?.currentTime || 0;
      const duration = audioRef.current?.duration;

      updateMediaSessionPositionState(
        duration
          ? {
              position,
              duration,
            }
          : undefined,
      );

      dispatch({
        type: 'setSeek',
        time: position,
      });
    }
    function onError() {
      const message = audioEl?.error?.message;
      console.debug(`[Player] audio error: ${message}`);
      dispatch({ type: 'playbackError' });
      showNotification({
        title: 'Cannot play song',
        message: message || 'Unknown error',
        type: 'error',
      });
    }
    function onProgress() {
      updateBufferedAmount();
    }
    function updateBufferedAmount() {
      dispatch({ type: 'setBuffered', to: computeBuffered(audioEl?.buffered) });
    }

    audioEl.addEventListener('loadstart', onLoadStart);
    audioEl.addEventListener('pause', onPause);
    audioEl.addEventListener('playing', onPlaying);
    audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('ended', onEnded);
    audioEl.addEventListener('error', onError);
    audioEl.addEventListener('progress', onProgress);
    const bufferInterval = setInterval(updateBufferedAmount, 1000);

    return () => {
      if (audioEl) {
        audioEl.removeEventListener('loadstart', onLoadStart);
        audioEl.removeEventListener('pause', onPause);
        audioEl.removeEventListener('playing', onPlaying);
        audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioEl.removeEventListener('timeupdate', onTimeUpdate);
        audioEl.removeEventListener('ended', onEnded);
        audioEl.removeEventListener('error', onError);
        audioEl.removeEventListener('progress', onProgress);
        clearInterval(bufferInterval);
      }
    };
  }, [audioRef, showNotification]);

  return (
    <PlayerContext.Provider
      value={[
        {
          canSkipNext,
          canSkipPrevious,
          queue,
          current,
          history,
          isPlaying: computeIsPlaying(playbackState, shouldPlayOnceReady),
          seek,
          shuffle,
          volume,
          isMuted,
          repeatMode,
          bufferedTo,
        },
        {
          skipNext,
          skipPrevious,
          play,
          pause,
          togglePlayPause,
          setSeek,
          setVolume,
          toggleMute,
          setRepeatMode,
          addArtistToQueue,
          addAlbumToQueue,
          addSongsToQueue,
          playNext,
          setShuffle,
          removeQueueItem,
          goToQueueIndex,
        },
      ]}
    >
      {children}
      <audio
        style={{ display: 'none', visibility: 'hidden' }}
        ref={audioRef}
        preload="metadata"
        src={current ? buildStreamUrl(current.song.id) : undefined}
      />
    </PlayerContext.Provider>
  );
}
