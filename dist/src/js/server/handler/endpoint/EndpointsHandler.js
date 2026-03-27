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
        const requestRoute = JSON.stringify({
            method: requestStream.method,
            path: new URL(`http://localhost${requestStream.url}`).pathname,
        });

        if (!this.#routeToEndpointMap.has(requestRoute)) {
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
                ...(await this.#routeToEndpointMap
                    .get(JSON.stringify(request.route))
                    .handle(request)),
            })
            .send();
    }
};
