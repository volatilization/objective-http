if (!env?.SERVER_PORT) {
    throw new Error('Server port is empty', {
        cause: { code: 'INVALID_CONFIG' },
    });
}

const { Server } = require('../index');
const handler = require('./handler');
const http = require('node:http');

const server = new Server({
    handler: handler({ env, errorHandler, endpoints }),
    options: { port: Number(env.SERVER_PORT) },
    http,
});
