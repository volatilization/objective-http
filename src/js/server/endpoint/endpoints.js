const { serverRequest } = require('../request');
const { serverResponse } = require('../response');

module.exports = Object.freeze({
    request: serverRequest,
    response: serverResponse,

    collection: undefined,

    _routeToEndpointMap() {
        if (!this.map) {
            this.map = new Map(
                this.collection?.map((endpoint) => [
                    JSON.stringify(endpoint.route()),
                    endpoint,
                ]),
            );
        }

        return this.map;
    },

    async handle() {
        const incomeRoute = JSON.stringify(this.request.route());
        const endpoint = this._routeToEndpointMap().has(incomeRoute)
            ? this._routeToEndpointMap().get(incomeRoute)
            : null;

        if (!endpoint) {
            throw new Error(`Endpoint for ${incomeRoute} not implemented`, {
                cause: { code: 'ENDPOINT_NOT_IMPLEMENTED' },
            });
        }

        await {
            ...endpoint,
            request: { ...endpoint.request, stream: this.request?.stream },
            response: { ...endpoint.response, stream: this.response?.stream },
        }.handle();

        return this;
    },
});
