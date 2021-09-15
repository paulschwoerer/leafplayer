import { buildArtworkUrl } from 'modules/api';
import { PlaybackState } from './reducer';
import { QueueItem } from './types';

type MediaSessionListenerCallbacks = {
  play: () => void;
  pause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekTo: (seekTime: number) => void;
};

const ARTWORK_SIZES = [96, 128, 192, 256, 384, 512];

export function updateMediaSessionPlayState(
  playbackState: PlaybackState,
): void {
  if (navigator.mediaSession) {
    navigator.mediaSession.playbackState = getMediaSessionStateForPlaybackState(
      playbackState,
    );
  }
}

export function updateMediaSessionMetaData(
  queueCurrent: QueueItem | null,
  authToken: string | null,
): void {
  if (!navigator.mediaSession) {
    return;
  }

  if (!queueCurrent) {
    navigator.mediaSession.metadata = null;
  } else {
    const { title, album, artist } = queueCurrent.song;

    const artworks = getArtworkUrls(queueCurrent.song.album.id, authToken);

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: artist.name,
      album: album.name,
      artwork: artworks,
    });
  }
}

export function updateMediaSessionPositionState(
  state:
    | {
        duration: number;
        position: number;
      }
    | undefined,
): void {
  if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
    navigator.mediaSession.setPositionState(state);
  }
}

export function addMediaSessionListeners({
  play,
  pause,
  skipNext,
  skipPrevious,
  seekTo,
}: MediaSessionListenerCallbacks): void {
  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', skipNext);
    navigator.mediaSession.setActionHandler('previoustrack', skipPrevious);
    navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) =>
      seekTo(seekTime),
    );
  }
}

export function removeMediaSessionListeners(): void {
  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
    navigator.mediaSession.setActionHandler('nexttrack', null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
    navigator.mediaSession.setActionHandler('seekto', null);
  }
}

function getArtworkUrls(albumId: string, authToken: string | null) {
  if (!authToken) {
    return undefined;
  }

  return ARTWORK_SIZES.map(size => ({
    src: buildArtworkUrl(
      {
        type: 'album',
        id: albumId,
        size,
      },
      authToken,
    ),
    type: 'image/jpeg',
    sizes: `${size}x${size}`,
  }));
}

function getMediaSessionStateForPlaybackState(
  state: PlaybackState,
): MediaSessionPlaybackState {
  if (state === PlaybackState.PLAYING) {
    return 'playing';
  }

  if (state === PlaybackState.PAUSED) {
    return 'paused';
  }

  return 'none';
}
