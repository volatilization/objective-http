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

    statusCode() {
        return this.#options.statusCode;
    }

    headers() {
        return this.#options.headers;
    }

    body() {
        return this.#options.body;
    }

    async flush() {
        try {
            return await new Promise((resolve, reject) => {
                this.#flushResponseInputStream(this.#inputStream, resolve, reject);
            });

        } catch (e) {
            throw new Error(e.message, {cause: 'INVALID_RESPONSE'});
        }
    }

    #flushResponseInputStream(inputStream, resolve, reject) {
        try {
            inputStream.once('error', (e) => reject(e));

            let chunks = [];
            inputStream.on('data', (chunk) => chunks.push(chunk));
            inputStream.on('end', () => resolve(
                new InputResponse(
                    inputStream,
                    {
                        statusCode: inputStream.statusCode,
                        headers: new Headers(inputStream.headers),
                        body: Buffer.concat(chunks)
                    }
                )
            ));

        } catch (e) {
            reject(e);
        }
    }
};