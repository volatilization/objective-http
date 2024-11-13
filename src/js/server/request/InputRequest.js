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

    route() {
        return this.#options.route;
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
                        route: {
                            method: this.#inputStream.method,
                            path: new URL(this.#inputStream.url, 'http://url').pathname
                        },
                        query: new URL(this.#inputStream.url, 'http://url').searchParams,
                        headers: new Headers(this.#inputStream.headers),
                        body: Buffer.concat(chunks),
                    }
                )));

            } catch (e) {
                reject(new Error(e.message, {cause: 'INVALID_REQUEST'}));
            }
        });
    }
};