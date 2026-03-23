module.exports = class HandlerNotFoundErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    async handle(requestStream, responseStream) {
        try {
            return await this.#origin.handle(requestStream, responseStream);
        } catch (e) {
            if (e.cause == null || e.cause.code !== 'HANDLER_NOT_FOUND') {
                throw e;
            }

            return this.#response
                .with({
                    responseStream,
                    status: 501,
                    body: e.message,
                })
                .send();
        }
    }
};
