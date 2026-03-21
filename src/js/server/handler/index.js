module.exports = class Handler {
    #endpoint;
    #requset;
    #response;

    constructor({ requset, response }) {
        this.#requset = requset;
        this.#response = response;
    }

    with({ requset = this.#requset, response = this.#response }) {
        return new Handler({ requset, response });
    }

    handle(requserStream, responseStream) {
        return this.#response.with({
            responseStream,
            oprtions: this.#endpoint
                .with({
                    route: this.#requset.with({ requserStream }).accept().route,
                })
                .handle(this.#requset.with({ requserStream }).accept()),
        });
    }
};

class InvalidRequestErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            if (e.cause.code !== 'INVALID_REQUEST') {
                throw e;
            }

            return this.#response.with({
                responseStream,
                status: 400,
                message: e.message,
            });
        }
    }
}

class HandlerNotFoundErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            if (e.cause.code !== 'HANDLER_NOT_FOUND') {
                throw e;
            }

            return this.#response.with({
                responseStream,
                status: 501,
                message: e.message,
            });
        }
    }
}

class UnexpectedErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            return this.#response.with({
                responseStream,
                status: 500,
                message: 'Application unexpected error',
            });
        }
    }
}
