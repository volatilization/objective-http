module.exports = class LoggedInputRequest {
    #origin;
    #inputStream;
    #logger;

    constructor(origin, logger, inputStream) {
        this.#origin = origin;
        this.#logger = logger;
        this.#inputStream = inputStream;
    }

    copy(inputStream, options, logger = this.#logger, origin = this.#origin.copy(inputStream, options)) {
        return new LoggedInputRequest(origin, logger, inputStream);
    }

    async flush() {
        this.#logger.debug(`HttpRequest: [${this.#inputStream.method}] ${this.#inputStream.url} ${JSON.stringify(this.#inputStream.headers)}`);

        return new LoggedInputRequest(await this.#origin.flush(), this.#logger);
    }

    route() {
        return this.#origin.route();
    }

    query() {
        return this.#origin.query();
    }

    body() {
        return this.#origin.body();
    }
}