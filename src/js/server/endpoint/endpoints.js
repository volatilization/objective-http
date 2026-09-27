const { serverRequest } = require('../request');
const { serverResponse } = require('../response');

module.exports = Object.freeze({
    request: serverRequest,
    response: serverResponse,

    collection: undefined,

    currentEndpoint() {
        return this.collection.find(
            (endpoint) =>
                JSON.stringify(endpoint.route()) ===
                JSON.stringify(this.request.route()),
        );
    },

    async handle(endpoint = this.currentEndpoint()) {
        if (!endpoint) {
            throw new Error(
                `Endpoint for ${JSON.stringify(this.request.route())} not implemented`,
                {
                    cause: { code: 'ENDPOINT_NOT_IMPLEMENTED' },
                },
            );
        }

        await {
            ...endpoint,
            request: { ...endpoint.request, stream: this.request.stream },
            response: { ...endpoint.response, stream: this.response.stream },
        }.handle();

        return this;
    },
});
