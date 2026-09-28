import fs from 'node:fs';
import dotenv from '@dotenvx/dotenvx';
dotenv.config({
    path: [
        fs.existsSync('.env') ? '.env' : null,
        fs.existsSync('.common.env') ? '.common.env' : null,
    ].filter((file) => file),
});

export default {
    $schema: 'https://unpkg.com/release-it@21/schema/release-it.json',
    plugins: {
        '@release-it/bumper': {
            in: './package.json',
            out: './package.json',
        },
    },
    git: {
        requireBranch: ['release/v*'],
        commitMessage: 'release v${version}',
        requireCleanWorkingDir: false,
        requireUpstream: false,
        commitArgs: ['--allow-empty'],
    },
    github: {
        release: true,
        tokenRef: 'RELEASE_IT_GITHUB_TOKEN',
    },
    npm: {
        publish: true,
        skipChecks: true,
        publishPath: './dist',
    },
    hooks: {
        'before:init': [
            'npm run build:cleanup',
            'npm run lint',
            'npm run test:coverage',
        ],
        'before:npm:release': ['npm run build'],
        'after:npm:release': ['npm run build:cleanup'],
    },
};
