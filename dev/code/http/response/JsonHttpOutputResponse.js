class JsonHttpOutputResponse {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    copy(outputStream, options, origin = this.#origin.copy(outputStream, options)) {
        return new JsonHttpOutputResponse(origin);
    }

    update(options) {
        return new JsonHttpOutputResponse(this.#origin.update(options));
    }

    flush() {
        return this.#origin
            .update({headers: {'Content-Type': 'application/json; charset=utf-8'}})
            .flush();
    }
}

module.exports = JsonHttpOutputResponse;