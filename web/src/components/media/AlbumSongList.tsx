import OptionsList from 'components/OptionsList/OptionsList';
import Popover from 'components/Popover/Popover';
import { FullSong } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import DiskNumber from './DiskNumber/DiskNumber';
import { SongRow } from './SongRow/SongRow';

type Props = {
  songs: FullSong[];
  songOptions?: (song: FullSong) => ReactElement;
  disableLinks?: boolean;
};

function AlbumSongList({ songs, songOptions }: Props) {
  const [
    { current, isPlaying: playerIsPlaying },
    { play, pause, addSongsToQueue },
  ] = useContext(PlayerContext);

  const disks = transformSongsToDisks(songs);
  const hasMultipleDisks = disks.size > 1;

  function onSongClicked(songId: string) {
    if (current && current.song.id === songId) {
      playerIsPlaying ? pause() : play();
    } else {
      const songsSelection = songs.slice(
        songs.findIndex(song => song.id === songId),
      );

      addSongsToQueue(songsSelection, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  function renderSong(song: FullSong) {
    return (
      <SongRow
        key={song.id}
        song={song}
        disableLinks
        onPlay={() => onSongClicked(song.id)}
        isCurrentlyPlaying={
          playerIsPlaying && !!current && current.song.id === song.id
        }
        options={songOptions ? songOptions(song) : <></>}
      />
    );
  }

  if (hasMultipleDisks) {
    const entries: ReactElement[] = [];
    disks.forEach((songs, disk) => {
      entries.push(<DiskNumber key={disk} disk={disk} />);
      entries.push(...songs.map(renderSong));
    });

    return <>{entries}</>;
  }

  return <>{songs.map(renderSong)}</>;
}

export default AlbumSongList;

function transformSongsToDisks(songs: FullSong[]): Map<number, FullSong[]> {
  const disks = new Map<number, FullSong[]>();

  for (const song of songs) {
    disks.set(song.disk, [...(disks.get(song.disk) || []), song]);
  }

  return disks;
}
