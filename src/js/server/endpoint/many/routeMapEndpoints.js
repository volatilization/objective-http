module.exports = {
    getMap() {
        return this.routeMap;
    },

    getCurrentEndpoint() {
        const incomeRoute = JSON.stringify(this.getRequest().getRoute());
        return this.getMap().has(incomeRoute)
            ? this.getMap().get(incomeRoute)
            : null;
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            routeMap: proxy.routeMap,
        };
    },

    init() {
        return {
            ...this,
            routeMap: new Map(
                this.getCollection().map((endpoint) => [
                    JSON.stringify(endpoint.getRoute()),
                    endpoint,
                ]),
            ),
        };
    },
};
