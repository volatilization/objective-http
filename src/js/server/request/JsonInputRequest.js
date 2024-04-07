module.exports = class JsonInputRequest {
    #origin;
    #inputStream;

    constructor(origin, inputStream) {
        this.#origin = origin;
        this.#inputStream = inputStream;
    }

    copy(inputStream, options, origin = this.#origin.copy(inputStream, options)) {
        return new JsonInputRequest(origin, inputStream);
    }

    async flush() {
        if (this.#useChunkMethod(this.#inputStream.method) && !this.#validHeaders(this.#inputStream.headers)) {
            throw new Error('Wrong content-type. Only application/json accepted.', {cause: 'INVALID_REQUEST'});
        }

        return new JsonInputRequest(await this.#origin.flush(), this.#inputStream);
    }

    route() {
        return this.#origin.route();
    }

    query() {
        return this.#origin.query();
    }

    body() {
        if (this.#origin.body() == null) {
            return null;
        }

        return JSON.parse(this.#origin.body().toString());
    }

    #useChunkMethod(requestMethod) {
        return ['POST', 'PUT'].some(method => method === requestMethod.toString().toUpperCase())
    }

    #validHeaders(requestHeaders) {
        return requestHeaders['content-type'] != null
            && new RegExp('^application\/json').test(requestHeaders['content-type']);
    }
}