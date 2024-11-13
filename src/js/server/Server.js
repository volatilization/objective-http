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

    options() {
        return this.#options;
    }

    start() {
        const server = this.#createServerFunction(async (requestStream, responseStream) => {
            try {
                return await this.#response
                    .copy(responseStream,
                        await this.#endpoints
                            .handle(await this.#request
                                .copy(requestStream)
                                .flush()))
                    .flush();

            } catch (e) {
                if (e.cause === 'INVALID_REQUEST') {
                    return this.#response
                        .copy(responseStream,
                            {statusCode: 400, body: e.message})
                        .flush();
                }

                if (e.cause === 'HANDLER_NOT_FOUND') {
                    return this.#response
                        .copy(responseStream,
                            {statusCode: 501, body: e.message})
                        .flush();
                }

                return this.#response
                    .copy(responseStream,
                        {statusCode: 500, body: 'Unexpected server error.'})
                    .flush();
            }
        });

        return new Promise(resolve => {
            server.listen(
                this.#options,
                () => resolve(new Server(
                    this.#endpoints,
                    this.#options,
                    this.#request,
                    this.#response,
                    this.#createServerFunction,
                    server))
            );
        });
    }

    stop() {
        return new Promise(resolve => {
            console.log('stop ', this.#server);

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
};