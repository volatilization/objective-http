class HttpEndpoint {
    #method;
    #path;

    constructor(method, path) {
        this.#method = method;
        this.#path = path;
    }

    copy(method = this.#method, path = this.#path) {
        return new HttpEndpoint(method, path);
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

module.exports = HttpEndpoint;