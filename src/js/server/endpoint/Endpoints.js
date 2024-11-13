module.exports = class Endpoints {
    #map;

    constructor(collection = [], map = new Map()) {
        this.#map = map;
        collection.forEach((endpoint) => {
            if (!this.#map.has(endpoint.route().path.toString().toLowerCase())) {
                this.#map.set(endpoint.route().path.toString().toLowerCase(), new Map());
            }

            this.#map
                .get(endpoint.route().path.toString().toLowerCase())
                .set(endpoint.route().method.toString().toUpperCase(),
                    endpoint);
        });
    }

    copy(collection, map = this.#map) {
        return new Endpoints(collection, map);
    }

    async handle(request) {
        if (!this.#map.has(request.route().path.toString().toLowerCase())
            || !this.#map
                .get(request.route().path.toString().toLowerCase())
                .has(request.route().method.toString().toUpperCase())
        ) {
            throw new Error('There are no handler for request.', {cause: 'HANDLER_NOT_FOUND'});
        }

        return await this.#map
            .get(request.route().path.toString().toLowerCase())
            .get(request.route().method.toString().toUpperCase())
            .handle(request);
    }
}