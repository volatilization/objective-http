module.exports = class ChunkServerRequest {
    #inputStream;
    #route;
    #query;
    #headers;
    #body;

    constructor({ inputStream, route, query, headers, body }) {
        this.#inputStream = inputStream;
        this.#route = route;
        this.#query = query;
        this.#headers = headers;
        this.#body = body;
    }

    with({
        inputStream = this.#inputStream,
        route = this.#route,
        query = this.#query,
        headers = this.#headers,
        body = this.#body,
    }) {
        return new ChunkServerRequest({
            inputStream,
            route,
            query,
            headers,
            body,
        });
    }

    route() {
        return this.#route;
    }

    query() {
        return this.#query;
    }

    body() {
        return this.#body;
    }

    headers() {
        return this.#headers;
    }

    accept() {
        return new Promise((resolve, reject) => {
            try {
                this.#inputStream.once('error', (e) =>
                    reject(
                        new Error(e.message, {
                            cause: { error: e, code: 'INVALID_REQUEST' },
                        }),
                    ),
                );

                let chunks = [];
                this.#inputStream.on('data', (chunk) => chunks.push(chunk));
                this.#inputStream.on('end', () =>
                    resolve(
                        this.with({
                            route: {
                                method: this.#inputStream.method,
                                path: URL.parse(this.#inputStream.url).pathname,
                            },
                            query: URL.parse(this.#inputStream.url)
                                .searchParams,
                            headers: new Headers(this.#inputStream.headers),
                            body: Buffer.concat(chunks),
                        }),
                    ),
                );
            } catch (e) {
                reject(
                    new Error(e.message, {
                        cause: { error: e, code: 'INVALID_REQUEST' },
                    }),
                );
            }
        });
    }
};
