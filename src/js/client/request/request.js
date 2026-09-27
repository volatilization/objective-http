const http = require('node:http');

const { clientResponse } = require('../response');

module.exports = Object.freeze({
    http: http,
    response: clientResponse,
    url: undefined,
    options: undefined,
});
