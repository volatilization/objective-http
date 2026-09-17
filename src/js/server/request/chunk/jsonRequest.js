const chunkRequest = require('./chunkRequest');

module.exports = Object.freeze({
    ...chunkRequest,

    origin: chunkRequest,

    async recive() {
        const recived = await {
            ...this.origin,
            stream: this.stream,
        }.recive();

        try {
            return {
                ...this,
                query: Object.fromEntries(recived.query),
                headers: Object.fromEntries(recived.headers),
                body:
                    recived.body?.length > 0
                        ? JSON.parse(recived.body?.toString())
                        : recived.body,
            };
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new Error(
                    `Invalid server json request. Body was ${recived.body}`,
                    {
                        cause: { error: e, code: 'INVALID_REQUEST' },
                    },
                );
            }

            throw e;
        }
    },
});
