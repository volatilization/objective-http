module.exports = class Bunttp {
    #serverConfig;
    #server;

    constructor(serverConfig = {}, server = {}) {
        this.#serverConfig = serverConfig;
        this.#server = server;
    }

    createServer(cb) {
        return new Bunttp({fetch: cb});
    }

    listen(options, cb) {
        const config = {...this.#serverConfig, port: options.port};
        const server = Bun.serve(config);
        cb();
        return new Bunttp(config, server);
    }

    close(cb) {
        const server = this.#server.stop();
        cb();
        return new Bunttp(this.#serverConfig, server);
    }

    request = fetch;
}