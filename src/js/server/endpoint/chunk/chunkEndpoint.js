const endpoint = require('../endpoint');

module.exports = Object.freeze({
    ...endpoint,

    getRoute() {
        if (this.implementation.route !== undefined) {
            return this.implementation.route;
        }

        return this.implementation.getRoute();
    },

    async handle() {
        const recivedRequest = await this.getRequest().recive();

        const handleResult = await this.implementation.handle({
            headers: recivedRequest.getHeaders(),
            query: recivedRequest.getQuery(),
            body: recivedRequest.getBody(),
        });

        ({
            ...this.getResponse(),
            ...handleResult,
        }).send();

        return this;
    },
});
