class JsonHttpEndpoint {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    copy(method, path, origin = this.#origin.copy(method, path)) {
        return new JsonHttpEndpoint(origin);
    }

    route() {
        return this.#origin.route();
    }

    async listen(request, response) {
        this.#validateHeaders(request.headers);

        return await this.#origin.listen(request, response);
    }

    #validateHeaders(headers) {
        if (headers == null || headers['content-type'] == null
            || !headers['content-type'].toString().includes('application/json')
        ) {
            throw new Error('Wrong request format. Accepted application/json only.', {cause: 'INVALID_CONTENT_TYPE'});
        }
    }
}

module.exports = JsonHttpEndpoint;