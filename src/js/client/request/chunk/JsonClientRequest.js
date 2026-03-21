module.exports = class JsonClientRequest {
    #origin;

    constructor({ origin }) {
        this.#origin = origin.with({
            body:
                origin.body != null ? JSON.stringify(origin.body) : origin.body,
        });
    }

    with({
        http,
        options,
        body,
        response,
        origin = this.#origin.with({
            http,
            options,
            body,
            response,
        }),
    }) {
        return new JsonClientRequest({ origin });
    }

    get http() {
        return this.#origin.http;
    }

    get options() {
        return this.#origin.options;
    }

    get body() {
        return this.#origin.body;
    }

    get response() {
        return this.#origin.response;
    }

    send() {
        return this.#origin.send();
    }
};
