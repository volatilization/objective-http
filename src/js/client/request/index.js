const request = require('./request');
const { chunkRequest, jsonChunkRequest } = require('./chunk');

module.exports = {
    request,
    chunk: {
        chunkRequest: { ...request, ...chunkRequest },
        jsonChunkRequest: { ...request, ...jsonChunkRequest },
    },
};
