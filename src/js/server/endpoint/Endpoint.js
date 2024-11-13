module.exports = class Endpoint {
    #route;

    constructor(route) {
        this.#route = route;
    }

    route() {
        return this.#route;
    }

    async handle() {
        return {
            statusCode: 200
        };
    }
}