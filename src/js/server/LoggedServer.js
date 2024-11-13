module.exports = class LoggedServer {
    #origin;
    #logger;

    constructor(origin, logger) {
        this.#origin = origin;
        this.#logger = logger;
    }

    options() {
        return this.#origin.options();
    }

    async start() {
        const server = await this.#origin.start();

        this.#logger.debug(`HttpServer is running at port: ${this.#origin.options().port}`);

        return new LoggedServer(server, this.#logger);
    }

    async stop() {
        const server = await this.#origin.stop();

        this.#logger.debug(`HttpServer at port: ${this.#origin.options().port} is stopped`);

        return new LoggedServer(server, this.#logger);
    }
}