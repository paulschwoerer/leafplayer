import { buildArtworkUrl } from 'modules/api';
import { PlaybackState } from './reducer';
import { QueueItem } from './types';

type MediaSessionListenerCallbacks = {
  skipNext: () => void;
  skipPrevious: () => void;
};

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

    let artworks = undefined;

    if (authToken) {
      const sizes = [96, 128, 192, 256, 384, 512];
      artworks = sizes.map(size => ({
        src: buildArtworkUrl(
          {
            type: 'album',
            id: queueCurrent.song.album.id,
            size,
          },
          authToken,
        ),
        type: 'image/jpeg',
        sizes: `${size}x${size}`,
      }));
    }

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
  skipNext,
  skipPrevious,
}: MediaSessionListenerCallbacks): void {
  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler('nexttrack', skipNext);
    navigator.mediaSession.setActionHandler('previoustrack', skipPrevious);
  }
}

export function removeMediaSessionListeners(): void {
  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler('nexttrack', null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
  }
}
