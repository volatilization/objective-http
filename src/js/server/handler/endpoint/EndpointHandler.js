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
        const request = await this.#request
            .with({
                requestStream,
            })
            .accept();

        if (
            JSON.stringify(request.route) !==
            JSON.stringify(this.#endpoint.route)
        ) {
            return;
        }

        return this.#response
            .with({
                responseStream,
                ...(await this.#endpoint.handle(request)),
            })
            .send();
    }
};
