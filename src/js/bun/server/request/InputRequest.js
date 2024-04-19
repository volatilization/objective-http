module.exports = class InputRequest {
    #inputStream;
    #options;

    constructor(inputStream, options) {
        this.#inputStream = inputStream;
        this.#options = options;
    }

    copy(inputStream = this.#inputStream, options = this.#options) {
        return new InputRequest(inputStream, options);
    }

    async flush() {
        try {
            return new InputRequest(
                this.#inputStream,
                {
                    method: this.#inputStream.method,
                    path: new URL(this.#inputStream.url).pathname,
                    query: new URL(this.#inputStream.url).searchParams,
                    headers: this.#inputStream.headers,
                    body: Buffer.from(await (await this.#inputStream.blob()).arrayBuffer())
                }
            );

        } catch (e) {
            throw new Error(e.message, {cause: 'INVALID_REQUEST'});
        }
    }

    route() {
        return {
            method: this.#options.method.toString().toUpperCase(),
            path: this.#options.path.toString().toLowerCase()
        }
    }

    query() {
        return this.#options.query;
    }

    body() {
        return this.#options.body;
    }

    headers() {
        return this.#options.headers;
    }
}