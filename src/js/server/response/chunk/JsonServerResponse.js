module.exports = class JsonServerResponse {
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
        return new JsonServerResponse({ origin });
    }

    get status() {
        return this.#origin.status;
    }

    get headers() {
        return {
            ...this.#origin.headers,
            'content-type': 'application/json',
        };
    }

    get body() {
        return this.#origin.body
            ? JSON.stringify(this.#origin.body)
            : this.#origin.body;
    }

    send() {
        try {
            return this.with({
                origin: this.#origin
                    .with({
                        headers: this.headers,
                        body: this.body,
                    })
                    .send(),
            });
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }

            return this.with({
                origin: this.#origin.send(),
            });
        }
    }
};
