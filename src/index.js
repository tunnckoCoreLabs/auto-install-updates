// import proc from 'process';
import unpdateNotifier from 'update-notifier';
import isInstalledGlobally from 'is-installed-globally';
import { exec } from '@tunnckocore/execa';

export default function updater(options) {
  const opts = Object.assign({}, options);

  if (!opts.pkg.name || !opts.pkg.version) {
    throw new Error('unpdateNotifier: pkg.name and pkg.version are required');
  }

  opts.callback = (err, info) => {
    if (err) {
      throw err;
    }
    if (info.type !== 'latest') {
      autoupdate(opts.pkg, opts.manager);
    }
  };

  return unpdateNotifier(opts);
}

async function autoupdate(pkg, manager) {
  const isNpm = manager === 'npm';

  if (isNpm || manager === 'pnpm') {
    await exec(
      `${isNpm ? 'npm' : 'pnpm'} install ${
        isInstalledGlobally ? '--global' : ''
      } ${pkg.name}`,
    );
  }

  if (manager === 'yarn') {
    const g = isInstalledGlobally ? 'global' : '';
    await exec([
      // ensure it is cleanest one
      `yarn ${g} remove ${pkg.name}`,

      // install it after that ensurance
      `yarn ${g} add ${pkg.name}`,
    ]);
  }
}
