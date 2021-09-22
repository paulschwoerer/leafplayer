import execa from 'execa';
import fs from 'fs';
import { dest, series, src } from 'gulp';
import { promisify } from 'util';

const stdio = 'inherit';

async function buildBackend() {
  await execa('npm', ['run', 'build'], {
    stdio,
  });
}

async function buildFrontend() {
  await execa('npm', ['run', 'build'], {
    cwd: 'web',
    stdio,
  });

  src('web/build/**/*').pipe(dest('build/public'));

  await makeReleasePackageJson();
}

async function makeReleasePackageJson() {
  const {
    name,
    version,
    description,
    main,
    author,
    license,
    dependencies,
    _moduleAliases,
  } = await readJsonFile('package.json');

  const output = {
    name,
    version,
    description,
    main,
    author,
    license,
    dependencies,
    _moduleAliases,
  };

  await writeJsonFile('build/package.json', output);
}

async function readJsonFile(path: string) {
  const buffer = await promisify(fs.readFile)(path);
  return JSON.parse(buffer.toString());
}

function writeJsonFile(path: string, contents: unknown) {
  return promisify(fs.writeFile)(path, JSON.stringify(contents, null, 2));
}

export const build = series(buildBackend, buildFrontend);
