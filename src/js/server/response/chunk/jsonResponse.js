const chunkResponse = require('./chunkRersponse');

module.exports = Object.freeze({
    ...chunkResponse,

    origin: chunkResponse,

    send() {
        ({
            ...this.origin,
            stream: this.stream,
            status: this.status,
            headers: {
                ...this.headers,
                'content-type': 'application/json',
            },
            body: JSON.stringify(this.body),
        }).send();

        return this;
    },
});
