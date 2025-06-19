import { Knex } from 'knex';

import { Share } from '@/common';
import { generateUuid } from '@/helpers/uuid';
import { ShareRow } from '@/database/rows';
import { LeafplayerConfig } from '@/config';

import { AlbumsService } from './AlbumsService';
import { ArtistsService } from './ArtistsService';
import { SongsService } from './SongsService';


type Injects = {
  config: LeafplayerConfig;
  db: Knex;
  artistsService: ArtistsService;
  albumsService: AlbumsService;
  songsService: SongsService;
};

export interface SharesService {
  create(params: {
    userId: string;
    forType: 'artist' | 'album' | 'song';
    forId: string;
    note: string;
  }): Promise<Share>;
  find(userId: string): Promise<Share[]>;
  findForTypeAndId(
    userId: string,
    forType: string,
    forId: string,
  ): Promise<Share[]>;
  delete(params: { userId: string; id: string }): Promise<void>;
}

export default function createSharesService({
  db,
  config,
  artistsService,
  albumsService,
  songsService,
}: Injects): SharesService {
  function isValidShare({ createdAt }: ShareRow) {
    return (
      new Date(createdAt) >=
      new Date(
        new Date().setDate(new Date().getDate() - config.shareLinkValidityDays),
      )
    );
  }

  async function mapShareRow({
    id,
    artistId,
    albumId,
    songId,
    ...rest
  }: ShareRow): Promise<Share> {
    if (artistId) {
      const artist = await artistsService.findById(artistId);
      return {
        id,
        type: 'artist',
        artist,
        ...rest,
      };
    }

    if (albumId) {
      const album = await albumsService.findById(albumId);
      return {
        id,
        type: 'album',
        album,
        ...rest,
      };
    }

    if (songId) {
      const song = await songsService.findById(songId);
      return {
        id,
        type: 'song',
        song,
        ...rest,
      };
    }

    throw Error(
      'cannot map share row, expected one of albumId, artistId or songId to be defined',
    );
  }

  return {
    async create({ userId, forType, forId, note }) {
      if (!['artist', 'album', 'song'].includes(forType)) {
        throw Error(
          `encountered invalid type '${forType}' when creating share`,
        );
      }

      const ids = {
        artistId: forType === 'artist' ? forId : null,
        albumId: forType === 'album' ? forId : null,
        songId: forType === 'song' ? forId : null,
      };

      const id = generateUuid();

      return db('shares').insert({
        id,
        userId,
        note,
        ...ids,
      });
    },

    async find(userId) {
      const rows = await db('shares')
        .where({ userId })
        .orderBy('shares.createdAt', 'desc');

      return Promise.all(rows.filter(isValidShare).map(mapShareRow));
    },

    async findForTypeAndId(userId, forType, forId) {
      const ids = {
        artistId: forType === 'artist' ? forId : null,
        albumId: forType === 'album' ? forId : null,
        songId: forType === 'song' ? forId : null,
      };

      const rows = await db('shares')
        .where({ userId, ...ids })
        .orderBy('shares.createdAt', 'desc');

      return Promise.all(rows.filter(isValidShare).map(mapShareRow));
    },

    async delete(params) {
      await db('shares').delete().where(params);
    },
  };
}
