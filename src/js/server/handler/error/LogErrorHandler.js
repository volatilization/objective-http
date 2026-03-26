module.exports = class LogErrorHandler {
    #origin;
    #logger;

    constructor({ origin, logger }) {
        this.#origin = origin;
        this.#logger = logger;
    }

    async handle(reqestStream, responseStream) {
        try {
            return await this.#origin.handle(reqestStream, responseStream);
        } catch (e) {
            this.#logger.error(`Error while handling ${reqestStream.url}`, {
                cause: { error: e },
            });

            throw e;
        }
    }
};
