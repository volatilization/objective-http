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

    async accept() {
        const accepted = await this.#origin.accept();

        try {
            return this.with({
                origin: accepted.with({
                    body:
                        accepted.body?.length > 0
                            ? JSON.parse(accepted.body?.toString())
                            : accepted.body,
                    headers: Object.fromEntries(accepted.headers),
                    query: Object.fromEntries(accepted.query),
                }),
            });
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new Error('Invalid server json request', {
                    cause: { error: e, code: 'INVALID_REQUEST' },
                });
            }

            throw e;
        }
    }
};
