module.exports = class JsonServerResponse {
    #origin;

    constructor({ origin }) {
        this.#origin = origin.with({
            headers: {
                ...{ 'Content-type': 'application/json' },
                ...origin.headers,
            },
            body:
                origin.body != null ? JSON.stringify(origin.body) : origin.body,
        });
    }

    with({
        outputStream,
        status,
        headers,
        body,
        origin = this.#origin({
            outputStream,
            status,
            headers,
            body,
        }),
    }) {
        return new JsonServerResponse({ origin });
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

    send() {
        return this.with({
            origin: this.#origin.send(),
        });
    }
};
