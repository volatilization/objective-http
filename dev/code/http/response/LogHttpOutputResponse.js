class LogHttpOutputResponse {
    #origin;
    #logger;

    constructor(origin, logger) {
        this.#origin = origin;
        this.#logger = logger;
    }

    copy(outputStream, options, logger = this.#logger, origin = this.#origin.copy(outputStream, options)) {
        return new LogHttpOutputResponse(origin, logger);
    }

    update(options) {
        return new LogHttpOutputResponse(this.#origin.update(options), this.#logger);
    }

    flush() {
        const outputStream = this.#origin.flush();

        this.#logger.debug(`HttpResponse: [${outputStream.req.method}] ${outputStream.req.url} - ${outputStream.statusCode}`);

        return outputStream;
    }
}

module.exports = LogHttpOutputResponse;