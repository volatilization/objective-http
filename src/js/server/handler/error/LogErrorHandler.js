module.exports = class LogErrorHandler {
    #origin;
    #logger;
    #inspect;

    constructor({ origin, logger, inspect }) {
        this.#origin = origin;
        this.#logger = logger;
        this.#inspect = inspect;
    }

    async handle(reqestStream, responseStream) {
        try {
            return await this.#origin.handle(reqestStream, responseStream);
        } catch (e) {
            this.#logger.error(
                `Error while handling ${reqestStream.method}:${reqestStream.url}`,
                this.#inspect(e, false, 256),
            );

            throw e;
        }
    }
};
