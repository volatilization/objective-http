const server = require('./server');
const endpoint = require('./endpoint');
const {
    request,
    chunk: { chunkRequest, jsonChunkRequest },
} = require('./request');
const {
    response,
    chunk: {
        chunkResponse,
        jsonChunkResponse,
        error: { errorResponse, statusMapErrorResponse },
    },
} = require('./response');

module.exports = {
    server,
    endpoint,
    request: {
        serverRequest: request,
        chunk: {
            serverChunkRequest: chunkRequest,
            serverJsonChunkRequest: jsonChunkRequest,
        },
    },
    response: {
        serverResponse: response,
        chunk: {
            serverChunkResponse: chunkResponse,
            serverJsonChunkResponse: jsonChunkResponse,
            error: {
                serverErrorResponse: errorResponse,
                serverStatusMapErrorResponse: statusMapErrorResponse,
            },
        },
    },
};
