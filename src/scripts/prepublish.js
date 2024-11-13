const fileSystem = require('node:fs');

if (process.env.RELEASE == null || !new RegExp('^\\d+\\.\\d+\\.\\d+$').test(process.env.RELEASE)) {
    throw new Error(`Invalid RELEASE: ${process.env.RELEASE} parameter`);
}

fileSystem.writeFileSync(
    'package.json',
    JSON.stringify({
        ...JSON.parse(fileSystem
            .readFileSync('package.json')
            .toString()),
        private: undefined,
        scripts: undefined,
        version: process.env.RELEASE,
        main: 'src/js/index.js'
    })
);

fileSystem.rmSync('src/test', {recursive: true, force: true});
fileSystem.rmSync('src/scripts', {recursive: true, force: true});
fileSystem.rmSync('.github', {recursive: true, force: true});