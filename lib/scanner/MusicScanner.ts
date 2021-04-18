import { statSync } from 'fs';
import { IAudioMetadata, parseFile } from 'music-metadata';
import { basename, extname } from 'path';
import { printInfo } from '../helpers/cli';
import { AlbumsService } from '../services/AlbumsService';
import { ArtistsService } from '../services/ArtistsService';
import { LibraryService } from '../services/LibraryService';
import { AudioFileRow } from './../database/rows';
import ArtworkExtractor from './ArtworkExtractor';
import ArtworkProcessor from './ArtworkProcessor';
import { DirNode, FileNode, FileTreeBuilder } from './FileTreeBuilder';
import { FileFormat, FileType } from './types';

const UNKNOWN_ARTIST_NAME = '[Unknown Artist]';
const UNKNOWN_ALBUM_NAME = '[Unknown Album]';

type Config = {
  storageDir: string;
};

type Options = {
  forceRescan?: boolean;
};

export default class MusicScanner {
  private skippedFiles: string[] = [];

  private options: Options | undefined;

  private fileTreeBuilder: FileTreeBuilder;
  private artworkExtractor: ArtworkExtractor;
  private artworkProcessor: ArtworkProcessor;

  constructor(
    private config: Config,
    private artistsService: ArtistsService,
    private albumsService: AlbumsService,
    private libraryService: LibraryService,
  ) {
    this.fileTreeBuilder = new FileTreeBuilder([
      {
        regex: /^\.mp3$/,
        format: FileFormat.MP3,
        type: FileType.AUDIO,
      },
      {
        regex: /^\.opus$/,
        format: FileFormat.OPUS,
        type: FileType.AUDIO,
      },
      {
        regex: /^\.jpe?g$/,
        format: FileFormat.JPG,
        type: FileType.IMAGE,
      },
    ]);
    this.artworkExtractor = new ArtworkExtractor();
    this.artworkProcessor = new ArtworkProcessor(this.config.storageDir);
  }

  async run(options?: Options): Promise<void> {
    if (options) {
      this.options = options;
    }

    const start = Date.now();
    const paths = await this.libraryService.getEnabledMediaDirectories();

    const trees: DirNode[] = [];

    for (const path of paths) {
      if (this.isDirectory(path)) {
        const tree = this.fileTreeBuilder.build(path);
        if (tree) {
          trees.push(tree);
        }
      }
    }

    for (const tree of trees) {
      await this.walk(tree);
    }

    const duration = (Date.now() - start) / 1000;
    printInfo(`Finished scanning in ${duration}s`);
    printInfo('Now processing artworks');

    await this.artworkProcessor.work();
  }

  private async walk(node: DirNode): Promise<void> {
    for (const dir of node.childDirs) {
      await this.walk(dir);
    }

    for (const file of node.audioFiles) {
      await this.analyzeAudioFile(file, node.imageFiles);
    }
  }

  private async analyzeAudioFile(
    file: FileNode,
    directoryArtworks: FileNode[],
  ): Promise<void> {
    let savedFile: AudioFileRow | undefined;

    try {
      savedFile = await this.libraryService.getAudioFileByPath(file.path);
    } catch (e) {
      console.error(e);
      return;
    }

    if (
      savedFile &&
      savedFile.lastModified === file.lastModified &&
      !this.shouldForceRescan()
    ) {
      this.skippedFiles.push(file.path);
      return;
    }

    const tags = await this.getTagsFromFile(file.path);

    const embeddedArtworks = this.artworkExtractor.extractArtworks(
      tags.common.picture,
    );

    const artistId = await this.createOrGetArtist(
      tags.common.artist || UNKNOWN_ARTIST_NAME,
    );

    let albumArtistId = artistId;

    if (
      tags.common.albumartist &&
      tags.common.albumartist !== tags.common.artist
    ) {
      albumArtistId = await this.createOrGetArtist(tags.common.albumartist);
    }

    if (embeddedArtworks.artist) {
      this.artworkProcessor.addArtistArtwork(artistId, {
        type: 'memory',
        buffer: embeddedArtworks.artist.data,
      });
    }

    const albumId = await this.createOrGetAlbum(
      albumArtistId,
      tags.common.album || UNKNOWN_ALBUM_NAME,
      tags.common.year,
    );

    if (embeddedArtworks.albumCover) {
      this.artworkProcessor.addAlbumArtwork(albumId, {
        type: 'memory',
        buffer: embeddedArtworks.albumCover.data,
      });
    }

    if (directoryArtworks.length > 0) {
      this.artworkProcessor.addAlbumArtwork(albumId, {
        type: 'file',
        path: directoryArtworks[0].path,
      });
    }

    const title = tags.common.title || basename(file.path, extname(file.path));
    const track = tags.common.track.no || null;
    const disk = tags.common.disk.no || 1;
    const duration = tags.format.duration;
    // const bitRate = tags.format.bitrate;
    // const sampleRate = tags.format.sampleRate;
    // const channels = tags.format.numberOfChannels;

    if (!duration) {
      console.error(`Cannot get duration of file ${file.path}`);
      return;
    }

    const songParams = {
      artistId,
      albumId,
      title,
      track,
      disk,
      duration,
    };

    if (!savedFile) {
      const fileId = await this.libraryService.createAudioFile({
        path: file.path,
        format: file.format,
        lastModified: file.lastModified,
        filesize: file.size,
      });

      await this.libraryService.createSong({
        ...songParams,
        fileId,
      });
    } else {
      await this.libraryService.updateAudioFile(savedFile.id, {
        lastModified: file.lastModified,
        filesize: file.size,
      });

      await this.libraryService.updateSongByFileId(savedFile.id, songParams);
    }
  }

  private async createOrGetArtist(name: string): Promise<string> {
    const existingId = await this.artistsService.findIdByName(name);

    if (existingId) {
      return existingId;
    }

    return this.artistsService.create({ name });
  }

  private async createOrGetAlbum(
    artistId: string,
    name: string,
    year?: number,
  ): Promise<string> {
    const existingId = await this.albumsService.findIdByNameAndArtistId({
      name,
      artistId,
    });

    if (existingId) {
      return existingId;
    }

    return this.albumsService.createAlbum({
      name,
      artistId,
      year,
    });
  }

  private async getTagsFromFile(path: string): Promise<IAudioMetadata> {
    const metadata = await parseFile(path, {
      duration: true,
    });

    return metadata;
  }

  private isDirectory(path: string): boolean {
    const stat = statSync(path);

    return stat.isDirectory();
  }

  private shouldForceRescan(): boolean {
    if (!this.options) {
      return false;
    }

    return this.options.forceRescan || false;
  }
}
