module.exports = class OutputRequest {
    #response;
    #requestFunction;
    #options;

    constructor(response, requestFunction, options) {
        this.#response = response;
        this.#requestFunction = requestFunction;
        this.#options = options;
    }

    copy(options = this.#options, response = this.#response, requestFunction = this.#requestFunction) {
        return new OutputRequest(response, requestFunction, options);
    }

    async send() {
        try {
            return await (this.#response
                .copy(await this.#requestFunction(this.#options.url, this.#options)))
                .flush()

        } catch (e) {
            throw new Error(e.message, {cause: 'INVALID_REQUEST'});
        }
    }
}