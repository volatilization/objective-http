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
                }),
            });
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }

            return this.with({
                origin: accepted,
            });
        }
    }
};
