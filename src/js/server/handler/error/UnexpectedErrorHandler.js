module.exports = class UnexpectedErrorHandler {
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
            return this.#response
                .with({
                    responseStream,
                    status: 500,
                    message: 'Application unexpected error',
                })
                .send();
        }
    }
};
