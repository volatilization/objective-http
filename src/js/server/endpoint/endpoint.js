module.exports = {
    getRequest() {
        return this.request;
    },

    getResponse() {
        return this.response;
    },

    getRoute() {
        return this.route;
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            request: proxy.request,
            response: proxy.response,
            route: proxy.route,
        };
    },
};
