const chunkRequest = require('./chunkRequest');

module.exports = Object.freeze({
    ...chunkRequest,

    origin: chunkRequest,

    async send() {
        return await {
            ...this.origin,
            http: this.http,
            response: this.response,
            options: {
                ...this.options,
                headers: {
                    ...this.options.headers,
                    'content-type': 'application/json',
                },
            },
            body: JSON.stringify(this.body),
        }.send();
    },
});
