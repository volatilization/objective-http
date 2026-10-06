const chunkResponse = require('./chunkRersponse');

module.exports = Object.freeze({
    ...chunkResponse,

    getHeaders() {
        return {
            ...{
                ...this.origin,
                headers: this.headers,
                body: this.getBody(),
            }.getHeaders(),
            'content-type': 'application/json',
        };
    },

    getBody() {
        const body = { ...this.origin, body: this.body }.getBody();

        return JSON.stringify(body);
    },
});
