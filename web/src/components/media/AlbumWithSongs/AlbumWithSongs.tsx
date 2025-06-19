import classNames from 'classnames';
import { ButtonText } from 'components/form/Button/Button';
import RoundButton from 'components/form/RoundButton/RoundButton';
import { PauseIcon, PlayIcon, ShareIcon } from 'components/icons';
import If from 'components/If';
import AppLink from 'components/layout/AppLink/AppLink';
import OptionsList from 'components/OptionsList/OptionsList';
import Popover from 'components/Popover/Popover';
import { SharingDialog } from 'components/sharing/SharingDialog/SharingDialog';
import { useAlbumPlayState } from 'helpers/albumPlayState';
import { FullAlbum, FullSong } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import AlbumDetails from '../AlbumDetails/AlbumDetails';
import AlbumSongList from '../AlbumSongList';
import ThemedAlbumArtwork from '../artworks/ThemedAlbumArtwork';
import styles from './AlbumWithSongs.module.scss';

type Props = {
  album: FullAlbum;
  songs: FullSong[];
  hideArtist?: boolean;
  artworkPosition?: 'above' | 'aside';
};

function AlbumWithSongs({
  album,
  songs,
  hideArtist,
  artworkPosition = 'above',
}: Props): ReactElement {
  const [, { addSongsToQueue, playNext }] = useContext(PlayerContext);
  const [isCurrentlyPlayingAlbum, togglePlayPause] = useAlbumPlayState(
    album.id,
  );

  function onPlayNextClicked() {
    playNext(songs);
  }

  function onEnqueueClicked() {
    addSongsToQueue(songs, { replaceQueue: false, startPlaying: false });
  }

  const artistName = hideArtist ? null : (
    <AppLink to={`/artist/${album.artist.id}`} title={album.artist.name}>
      {album.artist.name}
    </AppLink>
  );

  return (
    <div className={classNames(styles.root, styles[artworkPosition])}>
      <div className={styles.artwork}>
        <ThemedAlbumArtwork id={album.id} size={256} />
      </div>
      <div className={styles.content}>
        <AlbumDetails album={album} songs={songs} artistName={artistName} />
        <div className={styles.actions}>
          <RoundButton
            primary
            icon={isCurrentlyPlayingAlbum ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlayPause}
          />
          <Popover icon={<ShareIcon />}>
            <SharingDialog forType="album" forId={album.id} />
          </Popover>
          <div className={styles.mobilePopover}>
            <Popover closeOnClick>
              <OptionsList>
                <OptionsList.Option onClick={onPlayNextClicked}>
                  Play Next
                </OptionsList.Option>
                <OptionsList.Option onClick={onEnqueueClicked}>
                  Enqueue
                </OptionsList.Option>
                <If condition={!hideArtist}>
                  <OptionsList.Option to={`/artist/${album.artist.id}`}>
                    Open Artist Page
                  </OptionsList.Option>
                </If>
              </OptionsList>
            </Popover>
          </div>
          <span className={styles.desktopButtons}>
            <ButtonText onClick={onPlayNextClicked}>Play Next</ButtonText>
            <ButtonText onClick={onEnqueueClicked}>Enqueue</ButtonText>
          </span>
        </div>
      </div>
      <div className={styles.list}>
        <AlbumSongList
          songs={songs}
          songOptions={song => (
            <Popover align="left" closeOnClick>
              <OptionsList>
                <OptionsList.Option onClick={() => playNext([song])}>
                  Play Next
                </OptionsList.Option>
                <OptionsList.Option
                  onClick={() =>
                    addSongsToQueue([song], {
                      replaceQueue: false,
                      startPlaying: false,
                    })
                  }
                >
                  Enqueue
                </OptionsList.Option>
              </OptionsList>
            </Popover>
          )}
        />
      </div>
    </div>
  );
}

export default AlbumWithSongs;
