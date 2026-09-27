const chunkResponse = require('./chunkRersponse');

module.exports = Object.freeze({
    ...chunkResponse,

    send() {
        ({
            ...chunkResponse,
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
