module.exports = class OutputResponse {
    #options;
    #outputStream;

    constructor(options, outputStream) {
        this.#options = {...{statusCode: 200, headers: {}}, ...options};
        this.#outputStream = outputStream;
    }

    copy(outputStream = this.#outputStream, options = this.#options) {
        return new OutputResponse({...{statusCode: 200, headers: {}}, ...options}, outputStream);
    }

    flush() {
        try {
            return new Response(this.#options.body, {
                status: this.#options.statusCode,
                headers: this.#options.headers
            });

        } catch (e) {
            throw new Error(e.message, {cause: 'INVALID_RESPONSE'});
        }
    }
}