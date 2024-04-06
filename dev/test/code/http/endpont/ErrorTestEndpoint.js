class ErrorTestEndpoint {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    route() {
        return this.#origin
            .copy('PUT', '/api')
            .route();
    }

    async handle(request) {
        return this.#error(await this.#origin.handle(request));
    }

    #error(response) {
        try {
            throw new Error();

        } catch (e) {
            return {
                    statusCode: 403,
                    body: 'not for you'
                };
        }
    }
}

module.exports = ErrorTestEndpoint;