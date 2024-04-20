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
        return new Promise((resolve, reject) => {
            try {
                this.#inputStream.once('error', (e) =>
                    reject(new Error(e.message, {cause: 'INVALID_REQUEST'}))
                );

                let chunks = [];
                this.#inputStream.on('data', (chunk) => chunks.push(chunk));
                this.#inputStream.on('end', () => resolve(new InputRequest(
                    this.#inputStream,
                    {
                        method: this.#inputStream.method,
                        path: new URL(this.#inputStream.url, 'http://dummy').pathname,
                        query: new URL(this.#inputStream.url, 'http://dummy').searchParams,
                        headers: new Headers(this.#inputStream.headers),
                        body: Buffer.concat(chunks)
                    }
                )));

            } catch (e) {
                throw new Error(e.message, {cause: 'INVALID_REQUEST'});
            }
        });
    }

    route() {
        return {
            method: this.#options.method.toString().toUpperCase(),
            path: this.#options.path.toString().toLowerCase()
        };
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
};