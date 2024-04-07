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
                this.#inputStream.on('error', (e) => reject(e));

                if (!this.#isChunkedInputStream(this.#inputStream)) {
                    resolve(new InputRequest(
                        this.#inputStream,
                        this.#extractOptionsFromInputStream(this.#inputStream)
                    ));
                }

                let chunks = [];
                this.#inputStream.on('data', (chunk) => chunks.push(chunk));
                this.#inputStream.on('end', () => resolve(new InputRequest(
                    this.#inputStream,
                    {... this.#extractOptionsFromInputStream(this.#inputStream), body: Buffer.concat(chunks)}
                )));

            } catch (e) {
                reject(e);
            }
        });
    }

    route() {
        return {
            method: this.#options.method.toString().toUpperCase(),
            path: this.#options.path.toString().toLowerCase()
        }
    }

    query() {
        return this.#options.query;
    }

    body() {
        return this.#options.body;
    }

    #isChunkedInputStream(inputStream) {
        return ['POST', 'PUT'].some(method => method === inputStream.method.toString().toUpperCase());
    }

    #extractOptionsFromInputStream(inputStream) {
        return {
            method: inputStream.method,
            path: new URL(inputStream.url, 'http://dummy').pathname,
            query: new URL(inputStream.url, 'http://dummy').searchParams,
            headers: inputStream.headers
        };
    }
}