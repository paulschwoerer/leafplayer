export type FileType = 'audio' | 'image';

export type FileFormat = 'jpg' | 'mp3' | 'opus' | 'flac';

export type FileFormatFilter = {
  regex: RegExp;
  format: FileFormat;
  type: FileType;
};
