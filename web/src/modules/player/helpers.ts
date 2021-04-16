import { PlaybackState } from './reducer';
import { buildApiUrl } from 'modules/api';

export function buildStreamUrl(songId: string): string {
  return buildApiUrl(`stream/song/${songId}`);
}

export function computeIsPlaying(
  playbackState: PlaybackState,
  shouldPlayOnceReady: boolean,
): boolean {
  switch (playbackState) {
    case PlaybackState.NONE:
    case PlaybackState.ERROR:
    case PlaybackState.PAUSED:
    case PlaybackState.QUEUE_ENDED:
      return false;
    case PlaybackState.READY:
    case PlaybackState.LOADING:
    case PlaybackState.SONG_ENDED:
      return shouldPlayOnceReady;
    case PlaybackState.PLAYING:
      return true;
  }
}

export function computeBuffered(bufferedRanges?: TimeRanges): number {
  if (bufferedRanges && bufferedRanges.length > 0) {
    return bufferedRanges.end(bufferedRanges.length - 1);
  }

  return 0;
}
