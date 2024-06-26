module.exports = class Server {
    #endpoints;
    #options;
    #request;
    #response;
    #createServerFunction;
    #server;

    constructor(endpoints, options, request, response, createServerFunction, server) {
        this.#endpoints = endpoints;
        this.#options = options;
        this.#request = request;
        this.#response = response;
        this.#createServerFunction = createServerFunction;
        this.#server = server;
    }

    start() {
        const server = this.#createServerFunction(async (requestStream, responseStream) => {
            try {
                return await (this.#response
                    .copy(await this.#endpoints
                        .handle(await (this.#request
                            .copy(requestStream))
                            .flush()), responseStream))
                    .flush();

            } catch (e) {
                if (e.cause === 'INVALID_REQUEST') {
                    return this.#response
                        .copy({
                            statusCode: 400,
                            body: e.message
                        }, responseStream)
                        .flush();
                }

                return this.#response
                    .copy({
                        statusCode: 500,
                        body: 'Unexpected server error.'
                    }, responseStream)
                    .flush();
            }
        });

        return new Promise(resolve => {
            server.listen(
                this.#options,
                () => {
                    resolve(new Server(
                        this.#endpoints,
                        this.#options,
                        this.#request,
                        this.#response,
                        this.#createServerFunction,
                        server));
                }
            );
        });
    }

    stop() {
        return new Promise(resolve => {
            this.#server.close(
                () => resolve(new Server(
                    this.#endpoints,
                    this.#options,
                    this.#request,
                    this.#response,
                    this.#createServerFunction))
            );
        });
    }

    options() {
        return this.#options;
    }
};