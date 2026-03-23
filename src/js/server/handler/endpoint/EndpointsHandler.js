module.exports = class EndpointsHandler {
    #routeToEndpointMap;
    #request;
    #response;

    constructor({ endpoints, request, response }) {
        this.#request = request;
        this.#response = response;
        this.#routeToEndpointMap = new Map(
            endpoints.map((endpoint) => [
                JSON.stringify(endpoint.route),
                endpoint,
            ]),
        );
    }

    async handle(requestStream, responseStream) {
        const request = await this.#request
            .with({
                requestStream,
            })
            .accept();

        console.log(request.route);

        if (!this.#routeToEndpointMap.has(JSON.stringify(request.route))) {
            throw new Error(
                `Handler for ${JSON.stringify(request.route)} not found`,
                {
                    cause: { code: 'HANDLER_NOT_FOUND' },
                },
            );
        }

        return this.#response
            .with({
                responseStream,
                ...(await this.#routeToEndpointMap
                    .get(JSON.stringify(request.route))
                    .handle(request)),
            })
            .send();
    }
};
