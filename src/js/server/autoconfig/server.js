const { Server } = require('../index');
//const handler = require('./handler');
const endpoints = require('./endpoints');

//handler({ env, errorHandler, endpoints })

const server = new Server({
    endpoints,
});

module.exports = server;
