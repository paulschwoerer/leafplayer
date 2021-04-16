import { FileNode } from './FileTreeBuilder';
import fs from 'fs';

export default class DuplicateDetector {
  private fileSizeCache: Record<string, string[]> = {};

  public findDuplicate(file: FileNode): string | null {
    const cacheKey = file.size.toString();
    const cachedPaths = this.fileSizeCache[cacheKey];

    if (!cachedPaths) {
      this.fileSizeCache[cacheKey] = [file.path];
      return null;
    }

    return this.findFirstEqualFile(file.path, cachedPaths);
  }

  private findFirstEqualFile(
    path: string,
    pathsToCheck: string[],
  ): string | null {
    for (const p of pathsToCheck) {
      if (this.filesIdentical(path, p)) {
        return p;
      }
    }

    return null;
  }

  private filesIdentical(
    path1: string,
    path2: string,
    chunkSize = 8192,
  ): boolean {
    let offset = 0;

    const fd1 = fs.openSync(path1, 'r');
    const fd2 = fs.openSync(path2, 'r');

    const buffer1 = Buffer.alloc(chunkSize);
    const buffer2 = Buffer.alloc(chunkSize);

    function closeFiles() {
      fs.closeSync(fd1);
      fs.closeSync(fd2);
    }

    let bytesRead1: number;
    let bytesRead2: number;

    do {
      bytesRead1 = fs.readSync(fd1, buffer1, 0, chunkSize, offset);
      bytesRead2 = fs.readSync(fd1, buffer2, 0, chunkSize, offset);

      if (bytesRead1 !== bytesRead2) {
        closeFiles();
        return false;
      }

      if (!buffer1.equals(buffer2)) {
        closeFiles();
        return false;
      }

      offset += chunkSize;
    } while (bytesRead1 === chunkSize && bytesRead2 === chunkSize);

    closeFiles();

    return bytesRead1 === bytesRead2;
  }
}
