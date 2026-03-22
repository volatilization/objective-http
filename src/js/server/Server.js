module.exports = class Server {
    #handler;
    #options;
    #http;
    #server;

    constructor({ handler, options, http, server }) {
        this.#handler = handler;
        this.#options = options;
        this.#http = http;
        this.#server = server;
    }

    with({
        handler = this.#handler,
        options = this.#options,
        http = this.#http,
        server = this.#server,
    }) {
        return new Server({
            handler,
            options,
            http,
            server,
        });
    }

    get options() {
        return this.#options;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                const server = this.#http.createServer(this.#handler.handle);
                server.listen(this.options, () => resolve(this.with({ server })));
            } catch (e) {
                reject(new Error('Init server fail', {cause: {error: e, code: 'INITIAL_SERVER_FAIL'}}))
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.#server.close(() => resolve(this.with({ server: null })));
        });
    }
};
