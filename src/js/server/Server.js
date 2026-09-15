module.exports = class Server {
    #endpoint;
    #errorResponse;
    #options;
    #http;
    #server;

    constructor({ endpoint, errorResponse, options, http, server }) {
        this.#endpoint = endpoint;
        this.#errorResponse = errorResponse;
        this.#options = options;
        this.#http = http;
        this.#server = server;
    }

    with({
        endpoint = this.#endpoint,
        errorResponse = this.#errorResponse,
        options = this.#options,
        http = this.#http,
        server = this.#server,
    }) {
        return new Server({
            endpoint,
            errorResponse,
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
                    async (requestStream, responseStream) => {
                        try {
                            await this.#endpoint
                                .with({
                                    request: this.#endpoint.request.with({
                                        stream: requestStream,
                                    }),
                                    response: this.#endpoint.response.with({
                                        stream: responseStream,
                                    }),
                                })
                                .handle();
                        } catch (e) {
                            await this.#errorResponse
                                .with({
                                    stream: responseStream,
                                    error: e,
                                })
                                .send();
                        }
                    },
                );

                server.listen(this.options, () =>
                    resolve(this.with({ server })),
                );
            } catch (e) {
                reject(
                    new Error('Server initializing error', {
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
