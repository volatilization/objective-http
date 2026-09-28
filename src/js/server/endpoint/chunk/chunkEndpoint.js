const {
    chunk: { serverChunkRequest },
} = require('../../request');
const {
    chunk: { serverChunkResponse },
} = require('../../response');

module.exports = Object.freeze({
    request: serverChunkRequest,
    response: serverChunkResponse,

    implementation: undefined,

    route() {
        if (typeof this.implementation.route === 'function') {
            return this.implementation.route();
        }

        return this.implementation.route;
    },

    async handle() {
        const recivedRequest = await this.request.recive();

        const handleResult = await this.implementation.handle(recivedRequest);

        ({
            ...this.response,
            ...handleResult,
        }).send();

        return this;
    },
});
