class LogHttpServer {
    #origin;
    #logger;

    constructor(origin, logger) {
        this.#origin = origin;
        this.#logger = logger;
    }

    async start() {
        await this.#origin.start();

        this.#logger.debug(`HttpServer is running at port: ${this.#origin.options().port}`);

        return this;
    }

    options() {
        return this.#origin.options();
    }
}

module.exports = LogHttpServer;