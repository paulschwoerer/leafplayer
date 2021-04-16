import { useContext } from 'react';
import { PlayerContext } from '../modules/player/context';

export function useAlbumPlayState(albumId: string): [boolean, () => void] {
  const [
    { current, isPlaying: isPlayerPlaying },
    { play, pause, addAlbumToQueue },
  ] = useContext(PlayerContext);

  const isPlaying = current
    ? current.song.album.id === albumId && isPlayerPlaying
    : false;

  async function togglePlayPause() {
    if (current && current.song.album.id === albumId) {
      if (isPlayerPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      await addAlbumToQueue(albumId, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  return [isPlaying, togglePlayPause];
}
