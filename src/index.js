import fs from 'fs';
import path from 'path';
import unpdateNotifier from 'update-notifier';
import { exec } from '@tunnckocore/execa';
import globalDirs from 'global-dirs';

export default function updater(options) {
  const opts = Object.assign({}, options);

  if (!opts.pkg.name || !opts.pkg.version) {
    throw new Error('unpdateNotifier: pkg.name and pkg.version are required');
  }

  opts.callback = (err, info) => {
    if (err) {
      throw err;
    }
    if (isInstalledGlobally(opts.pkg) && info.type !== 'latest') {
      autoupdate(opts.pkg, opts.manager);
    }
  };

  return unpdateNotifier(opts);
}

function isInstalledGlobally({ name }) {
  /* eslint-disable no-restricted-syntax */

  let exists = false;
  for (const [, dirs] of Object.entries(globalDirs)) {
    for (const [, globalPath] of Object.entries(dirs)) {
      const fp = path.join(globalPath, name);
      if (fs.existsSync(fp)) {
        exists = true;
        break;
      }
    }
  }
  return exists;
}

async function autoupdate(pkg, manager) {
  const isNpm = manager === 'npm';

  if (isNpm || manager === 'pnpm') {
    await exec(`${isNpm ? 'npm' : 'pnpm'} install --global ${pkg.name}`);
  }

  if (manager === 'yarn') {
    await exec([
      // ensure it is cleanest one
      `yarn global remove ${pkg.name}`,

      // install it after that ensurance
      `yarn global add ${pkg.name}`,
    ]);
  }
}
