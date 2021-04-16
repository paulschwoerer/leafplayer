import { FileType, FileFormatFilter, FileFormat } from './types';
import { readdirSync, Stats, statSync } from 'fs';
import { extname } from 'path';

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

  public build(baseDir: string): DirNode | null {
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

  private buildDirNode(path: string): DirNode | null {
    const dirList = this.safelyGetDirList(path);

    if (!dirList) {
      return null;
    }

    const audioFiles: FileNode[] = [];
    const imageFiles: FileNode[] = [];
    const childDirs: DirNode[] = [];

    for (const item of dirList) {
      const itemPath = `${path}/${item}`;
      const stats = this.safelyGetFileStats(itemPath);

      if (stats && stats.isDirectory()) {
        const node = this.buildDirNode(itemPath);

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

  private safelyGetFileStats(path: string): Stats | null {
    try {
      return statSync(path);
    } catch (e) {
      console.warn(`Cannot get file stats: ${e.message}`);
      return null;
    }
  }

  private safelyGetDirList(path: string): string[] | null {
    try {
      return readdirSync(path);
    } catch (e) {
      if (e.code == 'EACCES' || e.code == 'EPERM') {
        console.warn(`Cannot list directory contents: ${e.message}`);
        return null;
      }

      throw e;
    }
  }
}
