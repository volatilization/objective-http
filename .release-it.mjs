import fs from 'node:fs';
import dotenv from '@dotenvx/dotenvx';
dotenv.config({
    path: [fs.existsSync('.env') ? '.env' : null, 'common.env'].filter(
        (file) => file,
    ),
});

console.log(process.env.RELEASE_IT_GITHUB_TOKEN);

export default {
    git: {
        requireBranch: ['master', 'release/*'],
        commitMessage: 'release v${version}',
        requireCleanWorkingDir: false,
        requireUpstream: false,
    },
    github: {
        release: true,
        tokenRef: 'RELEASE_IT_GITHUB_TOKEN',
    },
    npm: {
        publish: true,
        skipChecks: true,
    },
    hooks: {
        'before:init': ['npm run lint', 'npm run test:coverage'],
    },
};
