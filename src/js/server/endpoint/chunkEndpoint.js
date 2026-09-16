module.exports = Object.freeze({
    request: undefined,
    response: undefined,

    origin: undefined,

    route() {
        return this.origin.route;
    },

    async handle() {
        const recivedRequest = await this.request.recive();

        const handleResult = this.origin.handle(recivedRequest);

        ({
            ...this.response,
            ...handleResult,
        }).send();

        return this;
    },
});
