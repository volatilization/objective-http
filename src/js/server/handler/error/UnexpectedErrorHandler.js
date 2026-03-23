module.exports = class UnexpectedErrorHandler {
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
            console.error('Unexpected', e);
            return this.#response
                .with({
                    responseStream,
                    status: 500,
                    body: 'Application unexpected error',
                })
                .send();
        }
    }
};
