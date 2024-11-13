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
            this.#outputStream.writeHead(this.#options.statusCode, this.#options.headers)

            if (this.#options.body != null) {
                this.#outputStream.write(this.#options.body);
            }

            return this.#outputStream;

        } finally {
            this.#outputStream.end();
        }
    }
}