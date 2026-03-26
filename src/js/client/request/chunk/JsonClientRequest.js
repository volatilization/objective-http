module.exports = class JsonClientRequest {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
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
        return {
            ...this.#origin.options,
            headers: {
                ...this.#origin.options.headers,
                'content-type': 'application/json',
            },
        };
    }

    get body() {
        return this.#origin.body
            ? JSON.stringify(this.#origin.body)
            : this.#origin.body;
    }

    get response() {
        return this.#origin.response;
    }

    send() {
        return this.#origin
            .with({
                body: this.body,
                options: this.options,
            })
            .send();
    }
};
