module.exports = class Server {
    #endpoints;
    #options;
    #request;
    #response;
    #http;
    #server;

    constructor({ endpoints, options, request, response, http, server }) {
        this.#endpoints = endpoints;
        this.#options = options;
        this.#request = request;
        this.#response = response;
        this.#http = http;
        this.#server = server;
    }

    with({
        endpoints = this.#endpoints,
        options = this.#options,
        request = this.#request,
        response = this.#response,
        http = this.#http,
        server = this.#server,
    }) {
        return new Server({
            endpoints,
            options,
            request,
            response,
            http,
            server,
        });
    }

    get options() {
        return this.#options;
    }

    start() {
        const server = this.#http.createServer(
            async (requestStream, responseStream) => {
                try {
                    return await this.#response
                        .with({
                            response: await this.#endpoints.handle(
                                await this.#request.copy(requestStream).flush(),
                            ),
                        })
                        .flush();
                } catch (e) {
                    if (e.cause === 'INVALID_REQUEST') {
                        return this.#response
                            .copy(responseStream, {
                                statusCode: 400,
                                body: e.message,
                            })
                            .flush();
                    }

                    if (e.cause === 'HANDLER_NOT_FOUND') {
                        return this.#response
                            .copy(responseStream, {
                                statusCode: 501,
                                body: e.message,
                            })
                            .flush();
                    }

                    return this.#response
                        .copy(responseStream, {
                            statusCode: 500,
                            body: 'Unexpected server error.',
                        })
                        .flush();
                }
            },
        );

        return new Promise((resolve) => {
            server.listen(this.options, () =>
                resolve(
                    this.with({
                        server,
                    }),
                ),
            );
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.#server.close(() =>
                resolve(
                    this.with({
                        server: null,
                    }),
                ),
            );
        });
    }
};
