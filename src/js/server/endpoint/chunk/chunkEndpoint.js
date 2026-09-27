module.exports = Object.freeze({
    request: undefined,
    response: undefined,

    implementation: undefined,

    route() {
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
