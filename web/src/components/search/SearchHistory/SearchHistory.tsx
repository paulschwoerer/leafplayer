import { CloseIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import ApiLoader from 'components/layout/ApiLoader';
import Card from 'components/layout/Card/Card';
import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import ThemedAlbumArtwork from 'components/media/artworks/ThemedAlbumArtwork';
import ThemedArtistArtwork from 'components/media/artworks/ThemedArtistArtwork';
import {
  FindSearchHistoryEntriesResponseDto,
  FullAlbum,
  FullArtist,
  FullSong,
} from 'leafplayer-common';
import { makeApiDeleteRequest } from 'modules/api';
import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './SearchHistory.module.scss';

function SearchHistory(): ReactElement {
  return (
    <section>
      <SectionHeader headline="Recent Searches" />

      <ApiLoader<FindSearchHistoryEntriesResponseDto>
        slug="search/history"
        renderContent={({ entries }, { setData }) => {
          async function removeEntry(id: string) {
            await makeApiDeleteRequest(`search/history/${id}`);

            setData({
              entries: entries.filter(entry => entry.id !== id),
            });
          }

          return (
            <div className={styles.entriesGrid}>
              {entries.map(entry => {
                if (entry.type === 'artist') {
                  return (
                    <ArtistEntry
                      key={entry.id}
                      artist={entry.artist}
                      onRemove={() => removeEntry(entry.id)}
                    />
                  );
                }

                if (entry.type === 'album') {
                  return (
                    <AlbumEntry
                      key={entry.id}
                      album={entry.album}
                      onRemove={() => removeEntry(entry.id)}
                    />
                  );
                }

                if (entry.type === 'song') {
                  return (
                    <SongEntry
                      key={entry.id}
                      song={entry.song}
                      onRemove={() => removeEntry(entry.id)}
                    />
                  );
                }

                return null;
              })}
            </div>
          );
        }}
      />
    </section>
  );
}

function EntryContent({ children }: PropsWithChildren<unknown>): ReactElement {
  return <div className={styles.entryContent}>{children}</div>;
}

function BaseEntry({
  to,
  children,
  onRemove,
}: PropsWithChildren<{
  to: string;
  onRemove: () => void;
}>): ReactElement {
  return (
    <Card linkTo={to}>
      <section className={styles.entry}>
        {children}
        <IconButton
          ariaLabel="Remove from search history"
          icon={<CloseIcon />}
          onClick={ev => {
            ev.preventDefault();
            ev.stopPropagation();
            onRemove();
          }}
        />
      </section>
    </Card>
  );
}

function ArtistEntry({
  artist,
  onRemove,
}: {
  artist: FullArtist;
  onRemove: () => void;
}) {
  return (
    <BaseEntry to={`/artist/${artist.id}`} onRemove={onRemove}>
      <ThemedArtistArtwork id={artist.id} size={96} />
      <EntryContent>
        <h1 title={artist.name}>{artist.name}</h1>
        <h2>Artist</h2>
      </EntryContent>
    </BaseEntry>
  );
}

function AlbumEntry({
  album,
  onRemove,
}: {
  album: FullAlbum;
  onRemove: () => void;
}) {
  return (
    <BaseEntry to={`/album/${album.id}`} onRemove={onRemove}>
      <ThemedAlbumArtwork id={album.id} size={96} />
      <EntryContent>
        <h1 title={album.name}>{album.name}</h1>
        <h2>Album • {album.artist.name}</h2>
      </EntryContent>
    </BaseEntry>
  );
}

function SongEntry({
  song,
  onRemove,
}: {
  song: FullSong;
  onRemove: () => void;
}) {
  return (
    <BaseEntry to={`/album/${song.album.id}`} onRemove={onRemove}>
      <ThemedAlbumArtwork id={song.album.id} size={96} />
      <EntryContent>
        <h1 title={song.title}>{song.title}</h1>
        <h2>Song • {song.artist.name}</h2>
      </EntryContent>
    </BaseEntry>
  );
}

export default SearchHistory;
