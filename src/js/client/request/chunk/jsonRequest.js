const chunkRequest = require('./chunkRequest');

const {
    chunk: { clientJsonResponse },
} = require('../../response');

module.exports = Object.freeze({
    ...chunkRequest,

    response: clientJsonResponse,

    async send() {
        return await {
            ...chunkRequest,
            http: this.http,
            response: this.response,
            url: this.url,
            options: {
                ...this.options,
                headers: {
                    ...this.options?.headers,
                    'content-type': 'application/json',
                },
            },
            body: JSON.stringify(this.body),
        }.send();
    },
});
