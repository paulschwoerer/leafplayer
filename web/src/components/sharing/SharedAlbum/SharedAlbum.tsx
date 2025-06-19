import { ButtonOutlined } from 'components/form/Button/Button';
import { PlayIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import AlbumDetails from 'components/media/AlbumDetails/AlbumDetails';
import AlbumSongList from 'components/media/AlbumSongList';
import ThemedAlbumArtwork from 'components/media/artworks/ThemedAlbumArtwork';
import { useAlbumPlayState } from 'helpers/albumPlayState';
import { FullAlbum, FullSong } from 'leafplayer-common';
import { buildArtworkUrl } from 'modules/artworks';
import { PlayerContext } from 'modules/player/context';
import React, { useContext } from 'react';
import styles from './SharedAlbum.module.scss';

type Props = {
  album: FullAlbum;
  songs: FullSong[];
  artworkToken: string; // TODO: get via share context
};

function SharedAlbum({ album, songs, artworkToken }: Props) {
  const artworkUrl = buildArtworkUrl(
    {
      id: album.id,
      type: 'album',
      size: 256,
    },
    artworkToken,
  );

  const [
    { current, isPlaying: playerIsPlaying },
    { play, pause, addSongsToQueue },
  ] = useContext(PlayerContext);
  const [isCurrentlyPlayingAlbum, togglePlayPause] = useAlbumPlayState(
    album.id,
  );

  return (
    <div className={styles.root}>
      {/* TODO: add component? <BlurredImage /> or similar? */}
      <div className={styles.header}>
        <div
          className={styles.background}
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
        <div className={styles.artwork}>
          <ThemedAlbumArtwork id={album.id} size={256} />
        </div>

        <div className={styles.content}>
          <AlbumDetails
            album={album}
            songs={songs}
            artistName={album.artist.name}
          ></AlbumDetails>
          <div className={styles.actions}>
            <ButtonOutlined
              onClick={() =>
                addSongsToQueue(songs, {
                  replaceQueue: true,
                  startPlaying: true,
                })
              }
            >
              <Icon icon={<PlayIcon />} />
              Play
            </ButtonOutlined>
          </div>
        </div>
      </div>
      <div className={styles.list}>
        <AlbumSongList songs={songs} disableLinks />
      </div>
    </div>
  );
}

export default SharedAlbum;
