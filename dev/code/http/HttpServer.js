class HttpServer {
    #http;
    #request;
    #response;
    #endpoints;
    #options;

    constructor(http, request, response, endpoints, options) {
        this.#http = http;
        this.#request = request;
        this.#response = response;
        this.#endpoints = endpoints;
        this.#options = options;
    }

    start() {
        return new Promise(resolve => {
            this.#http
                .createServer(async (requestStream, responseStream) => {
                    try {
                        return await (this.#response
                            .copy(responseStream, await this.#endpoints
                                .handle(await (this.#request
                                    .copy(requestStream))
                                    .flush())))
                            .flush();

                    } catch (e) {
                        if (e.cause === 'INVALID_REQUEST') {
                            return this.#response
                                .copy(responseStream, {
                                    statusCode: 400,
                                    body: e.message
                                })
                                .flush();
                        }

                        return this.#response
                            .copy(responseStream, {
                                statusCode: 500,
                                body: 'Unexpected server error.'
                            })
                            .flush();
                    }
                })
                .listen(
                    {port: this.#options.port},
                    () => resolve(this)
                );
        });
    }

    options() {
        return this.#options;
    }
}

module.exports = HttpServer;