const chunkResponse = require('./chunkResponse');
const jsonChunkResponse = require('./jsonChunkResponse');

module.exports = {
    chunkResponse,
    jsonChunkResponse: { ...chunkResponse, ...jsonChunkResponse },
};
