module.exports = class JsonOutputResponse {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    copy(outputStream, options, origin = this.#origin.copy(outputStream, options)) {
        return new JsonOutputResponse(origin);
    }

    update(options) {
        return new JsonOutputResponse(this.#origin.update(options));
    }

    flush() {
        return this.#origin
            .update({headers: {'Content-Type': 'application/json; charset=utf-8'}})
            .flush();
    }
}