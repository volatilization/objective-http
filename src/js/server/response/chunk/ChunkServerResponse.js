module.exports = class ChunkServerResponse {
    #stream;
    #status;
    #headers;
    #body;

    constructor({ stream, status = 200, headers = {}, body }) {
        this.#stream = stream;
        this.#status = status;
        this.#headers = headers;
        this.#body = body;
    }

    with({
        stream = this.#stream,
        status = this.#status,
        headers = this.#headers,
        body = this.#body,
    }) {
        return new ChunkServerResponse({
            stream,
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
            this.#stream.writeHead(this.status, this.headers);

            if (this.body != null) {
                this.#stream.write(this.body);
            }

            return this;
        } finally {
            this.#stream.end();
        }
    }
};
