const fs = require('node:fs');

fs.mkdirSync('dist');
fs.cpSync('src/js', 'dist/src/js', { recursive: true, force: true });
//fs.cpSync('common.env', 'dist/common.env', { force: true });
fs.cpSync('package.json', 'dist/package.json', { force: true });
fs.cpSync('package-lock.json', 'dist/package-lock.json', {
    force: true,
});
fs.cpSync('LICENSE', 'dist/LICENSE', { force: true });
fs.cpSync('README.md', 'dist/README.md', { force: true });
