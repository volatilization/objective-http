const chunkEndpoint = require('./chunkEndpoint');

const {
    chunk: { serverJsonRequest },
} = require('../../request');
const {
    chunk: { serverJsonResponse },
} = require('../../response');

module.exports = Object.freeze({
    ...chunkEndpoint,

    request: serverJsonRequest,
    response: serverJsonResponse,
});
