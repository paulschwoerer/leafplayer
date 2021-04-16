import { IPicture } from 'music-metadata';

export type ExtractedArtwork = {
  format: string;
  data: Buffer;
};

type ExtractedArtworks = {
  albumCover: ExtractedArtwork | null;
  artist: ExtractedArtwork | null;
};

type Matcher = {
  match: string[];
  score: number;
  type: 'artist' | 'album_cover';
};

export default class ArtworkExtractor {
  private matchers: Matcher[] = [
    {
      match: ['other'],
      score: 0,
      type: 'album_cover',
    },
    {
      match: ['back', 'cover (back)'],
      score: 50,
      type: 'album_cover',
    },
    {
      match: ['front', 'cover', 'cover (front)'],
      score: 100,
      type: 'album_cover',
    },
    {
      match: ['conductor'],
      score: 60,
      type: 'artist',
    },
    {
      match: ['composer'],
      score: 70,
      type: 'artist',
    },
    {
      match: ['band', 'orchestra'],
      score: 80,
      type: 'artist',
    },
    {
      match: ['artist/performer', 'artist', 'performer'],
      score: 90,
      type: 'artist',
    },
    {
      match: ['lead artist', 'lead performer', 'soloist'],
      score: 100,
      type: 'artist',
    },
  ];

  public extractArtworks(pictures: IPicture[] | undefined): ExtractedArtworks {
    if (!pictures) {
      return {
        artist: null,
        albumCover: null,
      };
    }

    let artist: ExtractedArtwork | null = null;
    let cover: ExtractedArtwork | null = null;
    let artistScore = 0;
    let coverScore = 0;

    for (const picture of pictures) {
      const match = this.matchPicture(picture);

      if (match) {
        const [type, score] = match;

        if (type === 'artist' && score >= artistScore) {
          artist = {
            format: picture.format,
            data: picture.data,
          };
          artistScore = score;
        }

        if (type === 'album_cover' && score >= coverScore) {
          cover = {
            format: picture.format,
            data: picture.data,
          };
          coverScore = score;
        }
      }
    }

    return {
      artist,
      albumCover: cover,
    };
  }

  private matchPicture(
    picture: IPicture,
  ): ['artist' | 'album_cover', number] | null {
    if (!picture.type) {
      return null;
    }

    const type = picture.type.toLowerCase();

    for (const matcher of this.matchers) {
      if (matcher.match.includes(type)) {
        return [matcher.type, matcher.score];
      }
    }

    return null;
  }
}
