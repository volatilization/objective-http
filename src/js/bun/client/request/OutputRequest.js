module.exports = class OutputRequest {
    #response;
    #options;

    constructor(response, options) {
        this.#response = response;
        this.#options = options;
    }

    copy(options = this.#options, response = this.#response) {
        return new OutputRequest(response, options);
    }

    async send() {
        try {
            return await (this.#response
                .copy(await fetch(this.#options.url, this.#options)))
                .flush()

        } catch (e) {
            throw new Error(e.message, {cause: 'INVALID_REQUEST'});
        }
    }
}