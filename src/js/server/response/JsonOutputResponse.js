module.exports = class JsonOutputResponse {
    #origin;
    #options;

    constructor(origin, options) {
        this.#origin = origin;
        this.#options = options;
    }

    copy(options, outputStream, origin = this.#origin.copy(options, outputStream)) {
        return new JsonOutputResponse(origin, options);
    }

    update(options) {
        return new JsonOutputResponse(this.#origin.update(options));
    }

    flush() {
        const body = this.#options.body;

        if (body == null) {
            return this.#origin.flush();
        }

        if (typeof body === 'string') {
            try {
                JSON.parse(body);

                return this.#origin
                    .update({headers: {'Content-Type': 'application/json; charset=utf-8'}})
                    .flush();

            } catch (e) {
                return this.#origin.flush();
            }
        }

        return this.#origin
            .update({
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                body: JSON.stringify(body)
            })
            .flush();
    }
};