const chunkResponse = require('../chunkRersponse');

module.exports = Object.freeze({
    ...chunkResponse,

    getStatus() {
        return this.origin.getStatus() ?? 500;
    },

    getHeaders() {
        return { ...this.origin.getHeaders(), 'content-type': 'text/plain' };
    },

    getBody() {
        return this.getError().message;
    },

    getError() {
        return this.error;
    },
});
