const response = require('./response');
const { chunkResponse, jsonChunkResponse } = require('./chunk');

module.exports = {
    response,
    chunk: {
        chunkResponse: { ...response, ...chunkResponse },
        jsonChunkResponse: { ...response, ...jsonChunkResponse },
    },
};
