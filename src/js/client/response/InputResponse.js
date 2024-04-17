module.exports = class InputResponse {
    #inputStream;
    #options;

    constructor(inputStream, options) {
        this.#inputStream = inputStream;
        this.#options = options;
    }

    copy(inputStream = this.#inputStream, options = this.#options) {
        return new InputResponse(inputStream, options);
    }

    flush() {
        return new Promise((resolve, reject) => {
            this.#inputStream.once('error', (e) =>
                reject(new Error(e.message, {cause: 'INVALID_RESPONSE'}))
            );

            let chunks = [];
            this.#inputStream.on('data', (chunk) => chunks.push(chunk));
            this.#inputStream.on('end', () => resolve(new InputResponse(this.#inputStream,
                {
                    statusCode: this.#inputStream.statusCode,
                    headers: new Headers(this.#inputStream.headers),
                    body: Buffer.concat(chunks)
                }
            )));
        });
    }

    statusCode() {
        return this.#options.statusCode;
    }

    headers() {
        return this.#options.headers;
    }

    body() {
        return this.#options.body;
    }
};