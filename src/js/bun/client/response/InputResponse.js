module.exports = class InputResponse {
    #inputStream;
    #options;

    constructor(inputStream, options) {
        this.#inputStream = inputStream;
        this.#options = options;
    }

    copy(inputStream = this.#inputStream, options = this.#options) {
        return new InputResponse(inputStream, options);
    }

    async flush() {
        return new InputResponse(this.#inputStream,
            {
                statusCode: this.#inputStream.status,
                headers: this.#inputStream.headers,
                body: Buffer.from(await (await this.#inputStream.blob()).arrayBuffer())
            }
        );
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