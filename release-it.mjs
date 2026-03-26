export default {
    git: {
        requireBranch: 'release/{version}',
        commitMessage: 'release v${version}',
    },
    github: {
        release: false,
    },
    hooks: {
        'before:init': [
            'git pull',
            'npm run lint',
            'COVERAGE_MIN_PERCENT=75 npm run test:coverage',
        ],
    },
};
