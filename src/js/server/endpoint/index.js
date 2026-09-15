module.exports = class Endpoint {
    #request;
    #response;

    async handle() {
        return await this.#response
            .with({
                status: 200,
                body: this.#request.body,
            })
            .send();
    }
};

class Endpoints {
    #request;
    #response;
    #collection;
    #routeToEndpointMap = new Map(
        collection.map((endpoint) => [endpoint.route, endpoint]),
    );

    async handle() {
        if (!this.#routeToEndpointMap.has(this.#request.route)) {
            throw new Error(`Handler for ${this.#request.route} not found`, {
                cause: { code: 'HANDLER_NOT_FOUND' },
            });
        }

        const endpoint = this.#routeToEndpointMap.get(this.#request.route);

        await endpoint
            .with({
                request: endpoint.request.with({
                    stream: this.#request.stream,
                }),
                response: endpoint.response.with({
                    stream: this.#response.stream,
                }),
            })
            .handle();
    }
}

class DefaultEndpoint {
    #request;
    #response;

    get route() {
        return null;
    }

    async handle() {}
}
