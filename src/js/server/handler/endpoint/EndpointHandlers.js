module.exports = class EndpointHandlers {
    #handlers;

    constructor({ handlers }) {
        this.#handlers = handlers;
    }

    async handle(requsetStream, responseStream) {
        return this.#handlers.reduce(async (response, handler) => {
            if (response != null) {
                return response;
            }

            await handler.handle(requsetStream, responseStream);
        }, undefined);
    }
};
