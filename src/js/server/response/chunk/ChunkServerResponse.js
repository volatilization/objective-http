module.exports = class ChunkServerResponse {
    #responseStream;
    #status;
    #headers;
    #body;

    constructor({ responseStream, status = 200, headers = {}, body }) {
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
        return new ChunkServerResponse({
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

    send() {
        try {
            console.log('responding to client');
            this.#responseStream.writeHead(this.status, this.headers);

            if (this.body != null) {
                this.#responseStream.write(this.body);
            }

            return this;
        } finally {
            this.#responseStream.end();
        }
    }
};
