module.exports = class JsonClientResponse {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
    }

    with({
        responseStream,
        status,
        headers,
        body,
        origin = this.#origin.with({
            responseStream,
            status,
            headers,
            body,
        }),
    }) {
        return new JsonClientResponse({ origin });
    }

    get ok() {
        return this.#origin.ok;
    }

    get status() {
        return this.#origin.status;
    }

    get headers() {
        return this.#origin.headers;
    }

    get body() {
        return this.#origin.body;
    }

    async recive() {
        const recived = await this.#origin.recive();

        try {
            return this.with({
                origin: recived.with({
                    body:
                        recived.body?.length > 0
                            ? JSON.parse(recived.body?.toString())
                            : recived.body,
                    headers: Object.fromEntries(recived.headers),
                }),
            });
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
    }
};
