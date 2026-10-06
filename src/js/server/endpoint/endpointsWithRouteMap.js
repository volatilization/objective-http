const endpoints = require('./endpoints');

module.exports = Object.freeze({
    ...endpoints,

    getMap() {
        if (!this.map) {
            console.log('build new map');
            this.map = new Map(
                this.getCollection().map((endpoint) => [
                    JSON.stringify(endpoint.getRoute()),
                    endpoint,
                ]),
            );
        }

        return this.map;
    },

    getCurrentEndpoint() {
        console.log('ty get current endpoint', this.getRequest().getRoute());
        const incomeRoute = JSON.stringify(this.getRequest().getRoute());
        return this.getMap().has(incomeRoute)
            ? this.getMap().get(incomeRoute)
            : null;
    },
});
