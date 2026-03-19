module.exports = class Endpoint {
    #route;

    constructor({ route }) {
        this.#route = route;
    }

    with({ route = this.#route }) {
        return new Endpoint({ route });
    }

    get route() {
        return this.#route;
    }

    handle() {
        return {
            status: 200,
        };
    }
};
