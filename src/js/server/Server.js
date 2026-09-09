module.exports = class Server {
    #request;
    #options;
    #http;
    #server;

    constructor({ request, options, http, server }) {
        this.#request = request;
        this.#options = options;
        this.#http = http;
        this.#server = server;
    }

    with({
        request = this.#request,
        options = this.#options,
        http = this.#http,
        server = this.#server,
    }) {
        return new Server({
            request,
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
                const server = this.#http.createServer(
                    (requestStream, responseStream) => {
                        this.#request
                            .with({ stream: requestStream })
                            .recive()
                            .response.with({ stream: responseStream })
                            .send();
                    },
                    // await this.#handler.handle(
                    //     requestStream,
                    //     responseStream,
                    // ),
                );

                server.listen(this.options, () =>
                    resolve(this.with({ server })),
                );
            } catch (e) {
                reject(
                    new Error('Init server fail', {
                        cause: { error: e, code: 'INITIAL_SERVER_FAIL' },
                    }),
                );
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.#server.close(() => resolve(this.with({ server: null })));
        });
    }
};
