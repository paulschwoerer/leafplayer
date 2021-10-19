import { statSync, constants, Stats, access, stat, rm } from 'fs';

export function unixCheckIfWorldReadable(path: string): boolean {
  const stat = statSync(path);

  const mode = stat.mode.toString(8);

  return mode[mode.length - 1] !== '0';
}

export async function isReadable(path: string): Promise<boolean> {
  return new Promise(resolve => {
    access(path, constants.R_OK, err => resolve(!err));
  });
}

export async function statFile(path: string): Promise<Stats> {
  return new Promise((resolve, reject) => {
    stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

export async function removeDir(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rm(
      path,
      {
        recursive: true,
        force: true,
      },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
}
