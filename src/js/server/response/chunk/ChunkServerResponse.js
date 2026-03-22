module.exports = class ChunkServerResponse {
    #outputStream;
    #status;
    #headers;
    #body;

    constructor({ outputStream, status = 200, headers = {}, body }) {
        this.#outputStream = outputStream;
        this.#status = status;
        this.#headers = headers;
        this.#body = body;
    }

    with({
        outputStream = this.#outputStream,
        status = this.#status,
        headers = this.#headers,
        body = this.#body,
    }) {
        return new ChunkServerResponse({
            outputStream,
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
            this.#outputStream.writeHead(this.status, this.headers);

            if (this.body != null) {
                this.#outputStream.write(this.body);
            }

            return this;
        } finally {
            this.#outputStream.end();
        }
    }
};
