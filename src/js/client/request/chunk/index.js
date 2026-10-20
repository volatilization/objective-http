const chunkRequest = require('./chunkRequest');
const jsonChunkRequest = require('./jsonChunkRequest');

module.exports = {
    chunkRequest,
    jsonChunkRequest: { ...chunkRequest, ...jsonChunkRequest },
};
