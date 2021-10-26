import { readdir, stat, Stats } from 'fs';
import { extname } from 'path';

import { FileType, FileFormatFilter, FileFormat } from './types';

type TreeNode = {
  path: string;
};

export type DirNode = TreeNode & {
  childDirs: DirNode[];
  imageFiles: FileNode[];
  audioFiles: FileNode[];
};

export type FileNode = TreeNode & {
  size: number;
  format: FileFormat;
  type: FileType;
  lastModified: number;
};

export class FileTreeBuilder {
  private fileFormatFilters: FileFormatFilter[];

  constructor(fileFormatFilters: FileFormatFilter[]) {
    this.fileFormatFilters = fileFormatFilters;
  }

  public build(baseDir: string): Promise<DirNode | null> {
    return this.buildDirNode(baseDir);
  }

  private buildFileNode(path: string, stats: Stats): FileNode | null {
    const match = this.matchFileFormat(path);

    if (!match) {
      return null;
    }

    return {
      path,
      size: Math.floor(stats.size),
      lastModified: Math.floor(stats.mtimeMs),
      format: match.format,
      type: match.type,
    };
  }

  private async buildDirNode(path: string): Promise<DirNode | null> {
    const dirList = await this.safelyGetDirList(path);

    if (!dirList) {
      return null;
    }

    const audioFiles: FileNode[] = [];
    const imageFiles: FileNode[] = [];
    const childDirs: DirNode[] = [];

    for (const item of dirList) {
      const itemPath = `${path}/${item}`;
      // eslint-disable-next-line no-await-in-loop
      const stats = await this.safelyGetFileStats(itemPath);

      if (stats && stats.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop
        const node = await this.buildDirNode(itemPath);

        if (node) {
          childDirs.push(node);
        }
      } else if (stats && stats.isFile()) {
        const node = this.buildFileNode(itemPath, stats);

        if (node && node.type === FileType.AUDIO) {
          audioFiles.push(node);
        } else if (node && node.type === FileType.IMAGE) {
          imageFiles.push(node);
        }
      }
    }

    return { path, childDirs, imageFiles, audioFiles };
  }

  private matchFileFormat(path: string): FileFormatFilter | null {
    const extension = extname(path).toLowerCase();

    for (const filter of this.fileFormatFilters) {
      if (filter.regex.test(extension)) {
        return filter;
      }
    }

    return null;
  }

  private safelyGetFileStats(path: string): Promise<Stats | null> {
    return new Promise(resolve => {
      stat(path, (err, stats) => {
        if (err) {
          console.warn(`cannot get file stats: ${err.message}`);

          resolve(null);
        } else {
          resolve(stats);
        }
      });
    });
  }

  private safelyGetDirList(path: string): Promise<string[] | null> {
    return new Promise(resolve => {
      readdir(path, (err, files) => {
        if (err) {
          console.warn(`cannot list directory contents: ${err.message}`);

          resolve(null);
        } else {
          resolve(files);
        }
      });
    });
  }
}
