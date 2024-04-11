module.exports = class HttpServer {
    #http;
    #request;
    #response;
    #endpoints;
    #options;
    #server;

    constructor(http, request, response, endpoints, options, server) {
        this.#http = http;
        this.#request = request;
        this.#response = response;
        this.#endpoints = endpoints;
        this.#options = options;
        this.#server = server;
    }

    start() {
        const server = this.#http.createServer(async (requestStream, responseStream) => {
            try {
                return await (this.#response
                    .copy(responseStream, await this.#endpoints
                        .handle(await (this.#request
                            .copy(requestStream))
                            .flush())))
                    .flush();

            } catch (e) {
                if (e.cause === 'INVALID_REQUEST') {
                    return await (this.#response
                        .copy(responseStream, {
                            statusCode: 400,
                            body: e.message
                        }))
                        .flush();
                }

                return await (this.#response
                    .copy(responseStream, {
                        statusCode: 500,
                        body: 'Unexpected server error.'
                    }))
                    .flush();
            }
        });

        return new Promise(resolve => {
            server.listen(
                this.#options,
                () => resolve(new HttpServer(
                    this.#http,
                    this.#request,
                    this.#response,
                    this.#endpoints,
                    this.#options,
                    server))
            );
        });
    }

    stop() {
        return new Promise(resolve => {
            this.#server.close(
                () => resolve(new HttpServer(
                    this.#http,
                    this.#request,
                    this.#response,
                    this.#endpoints,
                    this.#options))
            );
        });
    }

    options() {
        return this.#options;
    }
};