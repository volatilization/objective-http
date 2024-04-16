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

    flush() {
        return new Promise((resolve) => {
            this.#inputStream.once('error', (e) => {
                throw new Error(e.message, {cause: 'INVALID_REQUEST'});
            });

            if (!this.#isChunkedInputStream(this.#inputStream)) {
                return resolve(new InputRequest(
                    this.#inputStream,
                    this.#extractOptionsFromInputStream(this.#inputStream)
                ));
            }

            let chunks = [];
            this.#inputStream.on('data', (chunk) => chunks.push(chunk));
            this.#inputStream.on('end', () => resolve(new InputRequest(
                this.#inputStream,
                {... this.#extractOptionsFromInputStream(this.#inputStream), body: Buffer.concat(chunks)}
            )));
        });
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
            path: new URL(inputStream.url, 'http://dummy').pathname,
            query: new URL(inputStream.url, 'http://dummy').searchParams,
            headers: new Headers(inputStream.headers)
        };
    }
}