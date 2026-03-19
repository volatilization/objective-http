module.exports = class Endpoints {
    #collection;
    #routeMap;

    constructor({ collection = [], routeMap = new Map() }) {
        collection.forEach((endpoint) => {
            if (!routeMap.has(endpoint.route.path.toString().toLowerCase())) {
                routeMap.set(
                    endpoint.route.path.toString().toLowerCase(),
                    new Map(),
                );
            }

            routeMap
                .get(endpoint.route.path.toString().toLowerCase())
                .set(endpoint.route.method.toString().toUpperCase(), endpoint);
        });

        this.#collection = collection;
        this.#routeMap = routeMap;
    }

    with({ collection = this.#collection, routeMap = this.#routeMap }) {
        return new Endpoints({ collection, routeMap });
    }

    async handle(request) {
        if (
            !this.#routeMap.has(request.route.path.toString().toLowerCase()) ||
            !this.#routeMap
                .get(request.route.path.toString().toLowerCase())
                .has(request.route.method.toString().toUpperCase())
        ) {
            throw new Error('There are no handler for request.', {
                cause: 'HANDLER_NOT_FOUND',
            });
        }

        return await this.#routeMap
            .get(request.route.path.toString().toLowerCase())
            .get(request.route.method.toString().toUpperCase())
            .handle(request);
    }
};
