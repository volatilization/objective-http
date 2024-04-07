module.exports = class Endpoints {
    #collection;

    constructor(collection = []) {
        this.#collection = collection;
    }

    copy(collection = this.#collection) {
        return new Endpoints(collection);
    }

    async handle(request) {
        const endpoint = this.#collection
            .find(endpoint => endpoint.route().method === request.route().method
                && endpoint.route().path === request.route().path);

        if (endpoint == null) {
            return {
                statusCode: 501,
                body: 'There are no handler for request.'
            }
        }

        return await endpoint.handle(request);
    }
}