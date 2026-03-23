module.exports = class JsonServerRequest {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
    }

    with({
        inputStream,
        route,
        query,
        headers,
        body,
        origin = this.#origin.with({
            inputStream,
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

        return this.with({
            origin: accepted.with({
                body: JSON.parse(accepted.body.toString()),
            }),
        });
    }
};
