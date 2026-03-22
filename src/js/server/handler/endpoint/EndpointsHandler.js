module.exports = class EndpointsHandler {
    #routeToEndpointMap;
    #requset;
    #response;

    constructor({ endpoints, requset, response }) {
        this.#requset = requset;
        this.#response = response;
        this.#routeToEndpointMap = new Map(
            endpoints.map((endpoint) => [
                JSON.stringify(endpoint.route),
                endpoint,
            ]),
        );
    }

    async handle(requsetStream, responseStream) {
        const requset = await this.#requset
            .with({
                requsetStream,
            })
            .accept();

        if (!this.#routeToEndpointMap.has(JSON.stringify(requset.route))) {
            throw new Error(`Handler for ${requset.route} not found`, {
                cause: { code: 'HANDLER_NOT_FOUND' },
            });
        }

        return this.#response
            .with({
                responseStream,
                ...(await this.#routeToEndpointMap
                    .get(JSON.stringify(requset.route))
                    .handle(requset)),
            })
            .send();
    }
};
