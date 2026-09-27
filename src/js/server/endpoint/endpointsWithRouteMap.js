const endpoints = require('./endpoints');

module.exports = Object.freeze({
    ...endpoints,

    init() {
        if (!this.map) {
            this.map = new Map(
                this.collection.map((endpoint) => [
                    JSON.stringify(endpoint.route()),
                    endpoint,
                ]),
            );
        }

        return this;
    },

    currentEndpoint() {
        const incomeRoute = JSON.stringify(this.request.route());
        return this.map.has(incomeRoute) ? this.map.get(incomeRoute) : null;
    },
});
