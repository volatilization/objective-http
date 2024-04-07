module.exports = class Endpoint {
    #method;
    #path;

    constructor(method, path) {
        this.#method = method;
        this.#path = path;
    }

    copy(method = this.#method, path = this.#path) {
        return new Endpoint(method, path);
    }

    route() {
        return {
            method: this.#method.toString().toUpperCase(),
            path: this.#path.toString().toLowerCase()
        };
    }

    async handle(request) {
        return {};
    }
}