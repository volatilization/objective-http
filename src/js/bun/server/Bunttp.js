module.exports = class Bunttp {
    #serverConfig;
    #server;

    constructor(serverConfig = {}, server = {}) {
        this.#serverConfig = serverConfig;
        this.#server = server;
    }

    createServer(cb) {
        this.#serverConfig.fetch = cb;
        return this;
    }

    listen(options, cb) {
        this.#serverConfig.port = options.port;
        this.#server = Bun.serve(this.#serverConfig);
        cb();
        return this;
    }

    close(cb) {
        this.#server.stop();
        cb();
        return this;
    }
}