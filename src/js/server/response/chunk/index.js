const chunkResponse = require('./chunkRersponse');
const jsonChunkResponse = require('./jsonChunkResponse');
const { errorResponse, statusMapErrorResponse } = require('./error');

module.exports = {
    chunkResponse,
    jsonChunkResponse: { ...chunkResponse, ...jsonChunkResponse },
    error: {
        errorResponse: { ...chunkResponse, ...errorResponse },
        statusMapErrorResponse: { ...chunkResponse, ...statusMapErrorResponse },
    },
};
