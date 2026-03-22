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

    route() {
        return this.#origin.route;
    }

    query() {
        return this.#origin.query;
    }

    body() {
        return this.#origin.body;
    }

    headers() {
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
