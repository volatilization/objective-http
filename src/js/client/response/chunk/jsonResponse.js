const chunkResponse = require('./chunkResponse');

module.exports = Object.freeze({
    ...chunkResponse,

    origin: chunkResponse,

    async recive() {
        const recived = await { ...this.origin, stream: this.stream }.recive();

        try {
            return {
                ...this,
                status: recived.status,
                headers: Object.fromEntries(recived.headers),
                body:
                    recived.body?.length > 0
                        ? JSON.parse(recived.body?.toString())
                        : recived.body,
            };
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new Error(
                    `Invalid client json response. Body was ${recived.body}`,
                    {
                        cause: { error: e, code: 'RESPONSE_ERROR' },
                    },
                );
            }

            throw e;
        }
    },
});
