import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import { FullAlbum, FullSong } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import AlbumWithSongs from '../AlbumWithSongs/AlbumWithSongs';
import styles from './ArtistDiscography.module.scss';

type Props = {
  albumsWithSongs: {
    album: FullAlbum;
    songs: FullSong[];
  }[];
};

function ArtistDiscography({ albumsWithSongs }: Props): ReactElement | null {
  return (
    <div>
      <SectionHeader headline="Discography" />
      <div className={styles.albums}>
        {albumsWithSongs.map(({ album, songs }) => (
          <AlbumWithSongs
            key={album.id}
            album={album}
            songs={songs}
            hideArtist={true}
            artworkPosition="aside"
          />
        ))}
      </div>
    </div>
  );
}

export default ArtistDiscography;
