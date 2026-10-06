const chunkResponse = require('./chunkResponse');

module.exports = Object.freeze({
    ...chunkResponse,

    getHeaders() {
        return Object.fromEntries(this.origin.getHeaders());
    },

    getBody() {
        if (this.origin.getBody()?.length <= 0) {
            return this.origin.getBody();
        }

        try {
            return JSON.parse(this.origin.getBody().toString());
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }

            throw new Error(
                `Invalid client json response. Body was ${this.origin.getBody()}`,
                {
                    cause: { error: e, code: 'RESPONSE_ERROR' },
                },
            );
        }
    },
});
