module.exports = class HandlerNotFoundErrorHandler {
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

            return this.#response
                .with({
                    responseStream,
                    status: 501,
                    message: e.message,
                })
                .send();
        }
    }
};
