import DefaultAlbumImage from 'assets/album-default.jpg';
import classNames from 'classnames';
import { ButtonText } from 'components/form/Button/Button';
import RoundButton from 'components/form/RoundButton/RoundButton';
import { PauseIcon, PlayIcon } from 'components/icons';
import If from 'components/If';
import OptionsDropdown from 'components/OptionsDropdown/OptionsDropdown';
import { useAlbumPlayState } from 'helpers/albumPlayState';
import { durationToString } from 'helpers/time';
import { FullAlbum, FullSong } from 'leafplayer-common';
import { useArtworkUrl } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import AppLink from '../../layout/AppLink/AppLink';
import Artwork from '../Artwork/Artwork';
import { SongCount } from '../Counts';
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

  const artworkUrl = useArtworkUrl({ type: 'album', id, size: 256 });
  const totalDuration = songs
    .map(song => song.duration)
    .reduce((accumulator, currentValue) => accumulator + currentValue);

  return (
    <div className={classNames(styles.root, styles[artworkPosition])}>
      <div className={styles.artwork}>
        <Artwork
          artworkUrl={artworkUrl}
          fallbackUrl={DefaultAlbumImage}
          noOverlay
        />
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
          <OptionsDropdown className={styles.dropdownToggle}>
            <OptionsDropdown.Option onClick={onPlayNextClicked}>
              Play Next
            </OptionsDropdown.Option>
            <OptionsDropdown.Option onClick={onEnqueueClicked}>
              Enqueue
            </OptionsDropdown.Option>
            <If condition={!hideArtist}>
              <OptionsDropdown.Option to={`/artist/${artist.id}`}>
                Open Artist Page
              </OptionsDropdown.Option>
            </If>
          </OptionsDropdown>
          <span className={styles.desktopButtons}>
            <ButtonText onClick={onPlayNextClicked}>Play Next</ButtonText>
            <ButtonText onClick={onEnqueueClicked}>Enqueue</ButtonText>
          </span>
        </div>
      </div>
      <div className={styles.list}>
        {songs.map(song => (
          <SongRow
            key={song.id}
            song={song}
            onPlay={() => onSongClicked(song.id)}
            isCurrentlyPlaying={
              playerIsPlaying && !!current && current.song.id === song.id
            }
            options={
              <OptionsDropdown align="right">
                <OptionsDropdown.Option onClick={() => playNext([song])}>
                  Play Next
                </OptionsDropdown.Option>
                <OptionsDropdown.Option
                  onClick={() =>
                    addSongsToQueue([song], {
                      replaceQueue: false,
                      startPlaying: false,
                    })
                  }
                >
                  Enqueue
                </OptionsDropdown.Option>
              </OptionsDropdown>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default AlbumWithSongs;
