const endpoint = require('./endpoint');

module.exports = Object.freeze({
    ...endpoint,

    getCollection() {
        return this.collection;
    },

    getCurrentEndpoint() {
        console.log('ty get current endpoint', this.getRequest().getRoute());

        return this.getCollection().find(
            (endpoint) =>
                JSON.stringify(endpoint.getRoute()) ===
                JSON.stringify(this.getRequest().getRoute()),
        );
    },

    async handle(currentEndpoint = this.getCurrentEndpoint()) {
        if (!currentEndpoint) {
            throw new Error(
                `Endpoint for ${JSON.stringify(this.getRequest().getRoute())} not implemented`,
                {
                    cause: { code: 'ENDPOINT_NOT_IMPLEMENTED' },
                },
            );
        }

        await {
            ...currentEndpoint,
            request: {
                ...currentEndpoint.getRequest(),
                stream: this.getRequest().getStream(),
            },
            response: {
                ...currentEndpoint.getResponse(),
                stream: this.getResponse().getStream(),
            },
        }.handle();

        return this;
    },
});
