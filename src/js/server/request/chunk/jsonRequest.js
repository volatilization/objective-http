const chunkRequest = require('./chunkRequest');

module.exports = Object.freeze({
    ...chunkRequest,

    getQuery() {
        return Object.fromEntries(
            {
                ...this.origin,
                query: this.query,
            }.getQuery(),
        );
    },

    getHeaders() {
        return Object.fromEntries(
            {
                ...this.origin,
                headers: this.headers,
            }.getHeaders(),
        );
    },

    getBody() {
        const body = { ...this.origin, body: this.body }.getBody();

        if (body?.length <= 0) {
            return body;
        }

        try {
            return JSON.parse(body.toString());
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }
            throw new Error(`Invalid server json request. Body was ${body}`, {
                cause: { error: e, code: 'INVALID_REQUEST' },
            });
        }
    },
});
