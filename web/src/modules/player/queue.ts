import { FullSong, SongsResponseDto } from 'leafplayer-common';
import { isApiError, makeApiGetRequest } from 'modules/api';
import { QueueItem } from './types';

export function songsToQueueItems(songs: FullSong[]): QueueItem[] {
  return songs.map(song => ({
    song,
  }));
}

async function loadSongsFromAPI(slug: string): Promise<FullSong[]> {
  const result = await makeApiGetRequest<SongsResponseDto>(slug);

  if (isApiError(result)) {
    console.warn(result);
    throw new Error(result.error);
  }

  return result.songs;
}

export function loadAlbumSongsFromAPI(albumId: string): Promise<FullSong[]> {
  return loadSongsFromAPI(`albums/${albumId}/songs`);
}

export function loadArtistSongsFromAPI(artistId: string): Promise<FullSong[]> {
  return loadSongsFromAPI(`artists/${artistId}/songs`);
}
