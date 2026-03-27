module.exports = class EndpontRequiredHandler {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
    }

    async handle(requestStream, responseStream) {
        const response = await this.#origin.handle(
            requestStream,
            responseStream,
        );

        if (response == null) {
            throw new Error(`Handler for ${requestStream.url} not found`, {
                cause: { code: 'HANDLER_NOT_FOUND' },
            });
        }

        return response;
    }
};
