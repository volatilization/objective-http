module.exports = {
    getCollection() {
        return this.collection;
    },

    getCurrentEndpoint() {
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

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            collection: proxy.collection,
        };
    },
};
