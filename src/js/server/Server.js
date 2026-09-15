module.exports = class Server {
    #endpoint;
    #request;
    #response;
    #options;
    #http;
    #server;

    constructor({
        endpoint,
        request = endpoint.request,
        response = endpoint.response,
        options,
        http,
        server,
    }) {
        this.#endpoint = endpoint;
        this.#request = request;
        this.#response = response;
        this.#options = options;
        this.#http = http;
        this.#server = server;
    }

    with({
        endpoint = this.#endpoint,
        request = this.#request,
        response = this.#response,
        options = this.#options,
        http = this.#http,
        server = this.#server,
    }) {
        return new Server({
            endpoint,
            request,
            response,
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
                        await this.#endpoint
                            .with({
                                request: this.#request.with({
                                    stream: requestStream,
                                }),
                                response: this.#response.with({
                                    stream: responseStream,
                                }),
                            })
                            .handle();
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
