const chunkResponse = require('./chunkRersponse');

module.exports = Object.freeze({
    ...chunkResponse,

    error: undefined,

    send() {
        ({
            ...chunkResponse,
            stream: this.stream,
            status: this.status ?? 500,
            headers: {
                ...this.headers,
                'content-type': 'text/plain',
            },
            body: this.error.message,
        }).send();

        return this;
    },
});
