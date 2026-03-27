const fs = require('node:fs');

fs.mkdirSync('objective-http');
fs.cpSync('src/js', 'objective-http/src/js', { recursive: true, force: true });
//fs.cpSync('common.env', 'objective-http/common.env', { force: true });
fs.cpSync('package.json', 'objective-http/package.json', { force: true });
fs.cpSync('package-lock.json', 'objective-http/package-lock.json', {
    force: true,
});
fs.cpSync('LICENSE', 'objective-http/LICENSE', { force: true });
fs.cpSync('README.md', 'objective-http/README.md', { force: true });
