module.exports = class LoggedEndpoint {
    #origin;
    #logger;

    constructor(origin, logger) {
        this.#origin = origin;
        this.#logger = logger;
    }

    copy(method, path, logger = this.#logger, origin = this.#origin.copy(method, path)) {
        return new LoggedEndpoint(origin, logger);
    }

    route() {
        return this.#origin.route();
    }

    async handle(request) {
        this.#logger.debug(`HttpEndpoint's handling [${request.route().method}] ${request.route().path}`);

        try {
            return await this.#origin.handle(request);

        } catch (e) {
            this.#logger.error(`HttpEndpoint's handling [${request.route().method}] ${request.route().path} error: ${e.message}`, e);

            throw e;
        }
    }
}