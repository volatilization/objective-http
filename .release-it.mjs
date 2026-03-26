export default {
    git: {
        requireBranch: ['release/*', 'master'],
        commitMessage: 'release v${version}',
    },
    github: {
        release: true,
    },
    npm: {
        release: true,
    },
    hooks: {
        'before:init': [
            'git pull',
            'npm run lint',
            'COVERAGE_MIN_PERCENT=75 npm run test:coverage',
        ],
    },
};
