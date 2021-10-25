import classNames from 'classnames';
import { ButtonText } from 'components/form/Button/Button';
import RoundButton from 'components/form/RoundButton/RoundButton';
import { PauseIcon, PlayIcon } from 'components/icons';
import If from 'components/If';
import OptionsPopover from 'components/OptionsPopover/OptionsPopover';
import { useAlbumPlayState } from 'helpers/albumPlayState';
import { durationToString } from 'helpers/time';
import { FullAlbum, FullSong } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import AppLink from '../../layout/AppLink/AppLink';
import ThemedAlbumArtwork from '../artworks/ThemedAlbumArtwork';
import { SongCount } from '../Counts';
import DiskNumber from '../DiskNumber/DiskNumber';
import { SongRow } from '../SongRow/SongRow';
import styles from './AlbumWithSongs.module.scss';

type Props = {
  album: FullAlbum;
  songs: FullSong[];
  hideArtist?: boolean;
  artworkPosition?: 'above' | 'aside';
};

function AlbumWithSongs({
  album: { id, name, year, artist },
  songs,
  hideArtist,
  artworkPosition = 'above',
}: Props): ReactElement {
  const [
    { current, isPlaying: playerIsPlaying },
    { play, pause, addSongsToQueue, playNext },
  ] = useContext(PlayerContext);
  const [isCurrentlyPlayingAlbum, togglePlayPause] = useAlbumPlayState(id);

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

  function onPlayNextClicked() {
    playNext(songs);
  }

  function onEnqueueClicked() {
    addSongsToQueue(songs, { replaceQueue: false, startPlaying: false });
  }

  function renderSong(song: FullSong) {
    return (
      <SongRow
        key={song.id}
        song={song}
        onPlay={() => onSongClicked(song.id)}
        isCurrentlyPlaying={
          playerIsPlaying && !!current && current.song.id === song.id
        }
        options={
          <OptionsPopover align="left">
            <OptionsPopover.Option onClick={() => playNext([song])}>
              Play Next
            </OptionsPopover.Option>
            <OptionsPopover.Option
              onClick={() =>
                addSongsToQueue([song], {
                  replaceQueue: false,
                  startPlaying: false,
                })
              }
            >
              Enqueue
            </OptionsPopover.Option>
          </OptionsPopover>
        }
      />
    );
  }

  function renderDisks(disks: Map<number, FullSong[]>) {
    const entries: ReactElement[] = [];
    disks.forEach((songs, disk) => {
      entries.push(<DiskNumber key={disk} disk={disk} />);
      entries.push(...songs.map(renderSong));
    });
    return entries;
  }

  const totalDuration = songs
    .map(song => song.duration)
    .reduce((accumulator, currentValue) => accumulator + currentValue);

  return (
    <div className={classNames(styles.root, styles[artworkPosition])}>
      <div className={styles.artwork}>
        <ThemedAlbumArtwork id={id} size={256} />
      </div>
      <div className={styles.details}>
        <h2 title={name}>{name}</h2>
        {!hideArtist && (
          <p>
            <AppLink to={`/artist/${artist.id}`} title={artist.name}>
              {artist.name}
            </AppLink>
          </p>
        )}
        <p className={styles.misc}>
          <span>{year || 'Unknown year'}</span>
          <span>
            <SongCount count={songs.length} />
          </span>
          <span>{durationToString(totalDuration, false, false)}</span>
        </p>
        <div className={styles.actions}>
          <RoundButton
            primary
            icon={isCurrentlyPlayingAlbum ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlayPause}
          />
          <div className={styles.mobilePopover}>
            <OptionsPopover>
              <OptionsPopover.Option onClick={onPlayNextClicked}>
                Play Next
              </OptionsPopover.Option>
              <OptionsPopover.Option onClick={onEnqueueClicked}>
                Enqueue
              </OptionsPopover.Option>
              <If condition={!hideArtist}>
                <OptionsPopover.Option to={`/artist/${artist.id}`}>
                  Open Artist Page
                </OptionsPopover.Option>
              </If>
            </OptionsPopover>
          </div>
          <span className={styles.desktopButtons}>
            <ButtonText onClick={onPlayNextClicked}>Play Next</ButtonText>
            <ButtonText onClick={onEnqueueClicked}>Enqueue</ButtonText>
          </span>
        </div>
      </div>
      <div className={styles.list}>
        <If condition={hasMultipleDisks}>{renderDisks(disks)}</If>
        <If condition={!hasMultipleDisks}>{songs.map(renderSong)}</If>
      </div>
    </div>
  );
}

export default AlbumWithSongs;

function transformSongsToDisks(songs: FullSong[]): Map<number, FullSong[]> {
  const disks = new Map<number, FullSong[]>();

  for (const song of songs) {
    disks.set(song.disk, [...(disks.get(song.disk) || []), song]);
  }

  return disks;
}
