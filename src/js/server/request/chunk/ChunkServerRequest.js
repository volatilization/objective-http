module.exports = class ChunkServerRequest {
    #requestStream;
    #route;
    #query;
    #headers;
    #body;

    constructor({ requestStream, route, query, headers, body }) {
        this.#requestStream = requestStream;
        this.#route = route;
        this.#query = query;
        this.#headers = headers;
        this.#body = body;
    }

    with({
        requestStream = this.#requestStream,
        route = this.#route,
        query = this.#query,
        headers = this.#headers,
        body = this.#body,
    }) {
        return new ChunkServerRequest({
            requestStream,
            route,
            query,
            headers,
            body,
        });
    }

    get route() {
        return this.#route;
    }

    get query() {
        return this.#query;
    }

    get body() {
        return this.#body;
    }

    get headers() {
        return this.#headers;
    }

    accept() {
        return new Promise((resolve, reject) => {
            try {
                this.#requestStream.on('error', (e) => {
                    reject(
                        new Error(e.message, {
                            cause: { error: e, code: 'INVALID_REQUEST' },
                        }),
                    );
                });

                let chunks = [];
                this.#requestStream.on('data', (chunk) => chunks.push(chunk));
                this.#requestStream.on('end', () => {
                    resolve(
                        this.with({
                            route: {
                                method: this.#requestStream.method,
                                path: new URL(
                                    `http://${process.env.HOST ?? 'localhost'}${this.#requestStream.url}`,
                                ).pathname,
                            },
                            query: new URL(
                                `http://${process.env.HOST ?? 'localhost'}${this.#requestStream.url}`,
                            ).searchParams,
                            headers: new Headers(this.#requestStream.headers),
                            body: Buffer.concat(chunks),
                        }),
                    );
                });
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
