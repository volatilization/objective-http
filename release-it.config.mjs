import fs from 'node:fs';
import dotenv from '@dotenvx/dotenvx';
dotenv.config({
    path: [
        fs.existsSync('.env') ? '.env' : null,
        fs.existsSync('common.env') ? 'common.env' : null,
    ].filter((file) => file),
});

export default {
    git: {
        requireBranch: ['master', 'release/*'],
        commitMessage: 'release v${version}',
        requireCleanWorkingDir: false,
        requireUpstream: false,
    },
    github: {
        release: true,
    },
    npm: {
        publish: true,
        skipChecks: true,
        publishPath: './dist',
    },
    hooks: {
        'before:init': [
            'npm run dist:cleanup',
            'npm run lint',
            'npm run test:coverage',
        ],
        'before:npm:release': ['npm run dist:build'],
        'after:npm:release': ['npm run dist:cleanup'],
    },
};
