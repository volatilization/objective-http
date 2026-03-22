module.exports = class LoggedServer {
    #origin;
    #logger;

    constructor({ origin, logger }) {
        this.#origin = origin;
        this.#logger = logger;
    }

    with({
        handler,
        options,
        http,
        server,
        origin = this.#origin.with({
            handler,
            options,
            http,
            server,
        }),
        logger = this.#logger,
    }) {
        return new LoggedServer({
            origin,
            logger,
        });
    }

    get options() {
        return this.#origin.options;
    }

    async start() {
        const server = await this.#origin.start();

        this.#logger.debug(
            `HttpServer is running at port: ${this.options.port}`,
        );

        return this.with({
            origin: server,
        });
    }

    async stop() {
        const server = await this.#origin.stop();

        this.#logger.debug(
            `HttpServer at port: ${this.options.port} is stopped`,
        );

        return this.with({
            origin: server,
        });
    }
};
