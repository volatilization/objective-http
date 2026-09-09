module.exports = class JsonServerRequest {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
    }

    with({
        requestStream,
        route,
        query,
        headers,
        body,
        origin = this.#origin.with({
            requestStream,
            route,
            query,
            headers,
            body,
        }),
    }) {
        return new JsonServerRequest({
            origin,
        });
    }

    get route() {
        return this.#origin.route;
    }

    get query() {
        return this.#origin.query;
    }

    get body() {
        return this.#origin.body;
    }

    get headers() {
        return this.#origin.headers;
    }

    async recicve() {
        const recived = await this.#origin.recicve();

        try {
            return this.with({
                origin: recived.with({
                    body:
                        recived.body?.length > 0
                            ? JSON.parse(recived.body?.toString())
                            : recived.body,
                    headers: Object.fromEntries(recived.headers),
                    query: Object.fromEntries(recived.query),
                }),
            });
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
    }
};
