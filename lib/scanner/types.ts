export enum FileType {
  AUDIO,
  IMAGE,
}

export enum FileFormat {
  JPG = 'jpg',
  MP3 = 'mp3',
  OPUS = 'opus',
  FLAC = 'flac',
}

export type FileFormatFilter = {
  regex: RegExp;
  format: FileFormat;
  type: FileType;
};
