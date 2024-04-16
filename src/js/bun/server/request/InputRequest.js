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
        if (!this.#isChunkedInputStream(this.#inputStream)) {
            return new InputRequest(
                this.#inputStream,
                this.#extractOptionsFromInputStream(this.#inputStream)
            );
        }

        return new InputRequest(
            this.#inputStream,
            {... this.#extractOptionsFromInputStream(this.#inputStream),
                body: new Buffer(await (await this.#inputStream.blob()).arrayBuffer())}
        );
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

    #isChunkedInputStream(inputStream) {
        return ['POST', 'PUT'].some(method => method === inputStream.method.toString().toUpperCase());
    }

    #extractOptionsFromInputStream(inputStream) {
        return {
            method: inputStream.method,
            path: new URL(inputStream.url).pathname,
            query: new URL(inputStream.url).searchParams,
            headers: inputStream.headers
        };
    }
}