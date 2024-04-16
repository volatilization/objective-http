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
        if (this.#useChunkMethod(this.#inputStream.method) && !this.#validHeaders(new Headers(this.#inputStream.headers))) {
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

        try {
            return JSON.parse(this.#origin.body().toString());

        } catch (e) {
            throw new Error('Wrong body format. Only JSON accepted.', {cause: 'INVALID_REQUEST'});
        }
    }

    headers() {
        return this.#origin.headers();
    }

    #useChunkMethod(requestMethod) {
        return ['POST', 'PUT'].some(method => method === requestMethod.toString().toUpperCase())
    }

    #validHeaders(requestHeaders) {
        return new Headers(requestHeaders).has('content-type')
            && new RegExp('^application\/json').test(new Headers(requestHeaders).get('content-type'));
    }
}