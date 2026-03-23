module.exports = class InvalidRequestErrorHandler {
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
            if (e.cause == null || e.cause.code !== 'INVALID_REQUEST') {
                throw e;
            }

            return this.#response
                .with({
                    responseStream,
                    status: 400,
                    body: e.message,
                })
                .send();
        }
    }
};
