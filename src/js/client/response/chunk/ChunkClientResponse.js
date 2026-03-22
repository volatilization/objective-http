module.exports = class ChunkClientResponse {
    #responseStream;
    #status;
    #headers;
    #body;

    constructor({ responseStream, status, headers, body }) {
        this.#responseStream = responseStream;
        this.#status = status;
        this.#headers = headers;
        this.#body = body;
    }

    with({
        responseStream = this.#responseStream,
        status = this.#status,
        headers = this.#headers,
        body = this.#body,
    }) {
        return new ChunkClientResponse({
            responseStream,
            status,
            headers,
            body,
        });
    }

    get status() {
        return this.#status;
    }

    get headers() {
        return this.#headers;
    }

    get body() {
        return this.#body;
    }

    get ok() {
        return Number(this.#status) === 200;
    }

    accept() {
        return new Promise((resolve) => {
            var chunks = [];
            this.#responseStream.on('data', (chunk) => {
                chunks = chunks.push(chunk);
            });
            this.#responseStream.on('end', () => {
                resolve(
                    this.with({
                        status: this.#responseStream.statusCode,
                        headers: new Headers(this.#responseStream.headers),
                        body: Buffer.concat(chunks),
                    }),
                );
            });
        });
    }
};
