module.exports = class EndpointHandlers {
    #handlers;

    constructor({ handlers }) {
        this.#handlers = handlers;
    }

    async handle(requestStream, responseStream) {
        for (let i = 0; i < this.#handlers.length; i++) {
            const response = await this.#handlers[i].handle(
                requestStream,
                responseStream,
            );

            if (response != null) {
                return response;
            }
        }

        return;
    }
};
