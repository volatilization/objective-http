const chunkRequest = require('./chunkRequest');

module.exports = Object.freeze({
    ...chunkRequest,

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
