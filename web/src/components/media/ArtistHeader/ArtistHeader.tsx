import { ButtonOutlined } from 'components/form/Button/Button';
import { PlayIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import { FullArtist } from 'leafplayer-common';
import { useArtworkUrl } from 'modules/artworks';
import React, { ReactElement } from 'react';
import ArtistCounts from '../ArtistCounts';
import ThemedArtistArtwork from '../artworks/ThemedArtistArtwork';
import styles from './ArtistHeader.module.scss';

type Props = {
  artist: FullArtist;
  onPlayClicked?: () => void;
};

function ArtistHeader({ artist, onPlayClicked }: Props): ReactElement {
  const artworkUrl = useArtworkUrl({
    id: artist.id,
    type: 'artist',
    size: 256,
  });

  return (
    <div className={styles.root}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${artworkUrl})` }}
      />
      <div className={styles.artwork}>
        <ThemedArtistArtwork id={artist.id} size={256} />
      </div>
      <div className={styles.content}>
        <ArtistCounts artist={artist} />
        <div className={styles.name}>
          <h1>{artist.name}</h1>
        </div>
        <div className={styles.actions}>
          <ButtonOutlined onClick={onPlayClicked}>
            <Icon icon={<PlayIcon />} />
            Play
          </ButtonOutlined>
        </div>
      </div>
    </div>
  );
}

export default ArtistHeader;
