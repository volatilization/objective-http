module.exports = class InvalidRequestErrorHandler {
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

            return this.#response
                .with({
                    responseStream,
                    status: 400,
                    message: e.message,
                })
                .send();
        }
    }
};
