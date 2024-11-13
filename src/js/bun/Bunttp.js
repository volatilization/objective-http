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
        this.#server = Bun.serve({...this.#serverConfig, port: options.port});
        cb();
    }

    close(cb) {
        this.#server.stop();
        cb();
    }

    request = fetch;
}