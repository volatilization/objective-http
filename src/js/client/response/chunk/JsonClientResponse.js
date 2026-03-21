module.exports = class JsonClientResponse {
    #origin;

    constructor({ origin }) {
        this.#origin = origin.with({
            body:
                origin.body != null || origin.body.length > 0
                    ? JSON.parse(origin.body.toString())
                    : origin.body,
        });
    }

    with({
        status,
        headers,
        body,
        origin = this.#origin.with({
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
};
