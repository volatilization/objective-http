module.exports = class EndpointHandler {
    #endpoint;
    #request;
    #response;

    constructor({ endpoint, request, response }) {
        this.#endpoint = endpoint;
        this.#request = request;
        this.#response = response;
    }

    async handle(requestStream, responseStream) {
        if (
            JSON.stringify({
                method: requestStream.method,
                path: new URL(
                    `http://${process.env.HOST ?? 'localhost'}${requestStream.url}`,
                ).pathname,
            }) !== JSON.stringify(this.#endpoint.route)
        ) {
            return;
        }

        const request = await this.#request
            .with({
                requestStream,
            })
            .accept();

        return this.#response
            .with({
                responseStream,
                ...(await this.#endpoint.handle(request)),
            })
            .send();
    }
};
