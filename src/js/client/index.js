const {
    request,
    chunk: { chunkRequest, jsonChunkRequest },
} = require('./request');
const {
    response,
    chunk: { chunkResponse, jsonChunkResponse },
} = require('./response');

module.exports = {
    request: {
        clientRequest: request,
        chunk: {
            clientChunkRequest: chunkRequest,
            clientJsonChunkRequest: jsonChunkRequest,
        },
    },
    response: {
        clientResponse: response,
        chunk: {
            clientChunkResponse: chunkResponse,
            clientJsonChunkResponse: jsonChunkResponse,
        },
    },
};
