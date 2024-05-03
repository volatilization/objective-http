module.exports = class LoggedOutputResponse {
    #origin;
    #logger;

    constructor(origin, logger) {
        this.#origin = origin;
        this.#logger = logger;
    }

    copy(options, outputStream, logger = this.#logger, origin = this.#origin.copy(options, outputStream)) {
        return new LoggedOutputResponse(origin, logger);
    }

    update(options) {
        return new LoggedOutputResponse(this.#origin.update(options), this.#logger);
    }

    flush() {
        const outputStream = this.#loggedFlush();

        this.#logger.debug(`HttpResponse: [${outputStream.req.method}] ${outputStream.req.url} - ${outputStream.statusCode}`);

        return outputStream;
    }

    #loggedFlush() {
        try {
            return this.#origin.flush();

        } catch (e) {
            this.#logger.error(`HttpResponse error: ${e.message}`, e);

            throw e;
        }
    }
}