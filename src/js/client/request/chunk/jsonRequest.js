const chunkRequest = require('./chunkRequest');

const {
    chunk: { clientJsonResponse },
} = require('../../response');

module.exports = Object.freeze({
    ...chunkRequest,

    response: clientJsonResponse,

    getOptions() {
        return {
            ...this.origin.getOptions(),
            headers: {
                ...this.origin.getOptions()?.headers,
                'content-type': 'application/json',
            },
        };
    },

    getBody() {
        return JSON.stringify(this.origin.getBody());
    },
});
