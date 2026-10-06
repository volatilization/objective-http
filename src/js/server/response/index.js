const response = require('./response');
const {
    chunkResponse,
    jsonChunkResponse,
    error: { errorResponse, statusMapErrorResponse },
} = require('./chunk');

module.exports = {
    response,
    chunk: {
        chunkResponse: { ...response, ...chunkResponse },
        jsonChunkResponse: { ...response, ...jsonChunkResponse },
        error: {
            errorResponse: { ...response, ...errorResponse },
            statusMapErrorResponse: { ...response, ...statusMapErrorResponse },
        },
    },
};
