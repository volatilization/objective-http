module.exports = class ClientResponse {
    #status;
    #headers;
    #body;

    constructor({ status, headers, body }) {
        this.#status = status;
        this.#headers = headers;
        this.#body = body;
    }

    with({ status, headers, body }) {
        return new ClientResponse({ status, headers, body });
    }

    get ok() {
        return Number(this.#status) === 200;
    }

    get status() {
        return this.#status;
    }

    get headers() {
        return this.#headers;
    }

    get body() {
        return this.#body;
    }
};
