const fileSystem = require('node:fs');

if (process.env.RELEASE == null || !new RegExp('^\\d+\\.\\d+\\.\\d+$').test(process.env.RELEASE)) {
    throw new Error(`invalid RELEASE: ${process.env.RELEASE} param`);
}

removeNotSources(
    rewritePackage(
        updatePackage(
            readPackage()
        )
    )
);


function readPackage() {
    return JSON.parse(fileSystem.readFileSync('package.json').toString());
}

function updatePackage(packageJSON) {
    return {...packageJSON, private: undefined, scripts: undefined, version: process.env.RELEASE, main: 'src/js/index.js'};
}

function rewritePackage(packageJSON) {
    fileSystem.writeFileSync('package.json', JSON.stringify(packageJSON));
}

function removeNotSources() {
    fileSystem.rmSync('src/test', {recursive: true, force: true});
    fileSystem.rmSync('dist', {recursive: true, force: true});
}