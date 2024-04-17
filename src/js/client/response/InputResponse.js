module.exports = class InputResponse {
    #options;

    constructor(options) {
        this.#options = options;
    }

    copy(options = this.#options) {
        return new InputResponse(options);
    }

    statusCode() {
        return this.#options.statusCode;
    }

    headers() {
        return this.#options.headers;
    }

    body() {
        return this.#options.body;
    }
}