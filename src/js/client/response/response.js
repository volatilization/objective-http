module.exports = {
    getStream() {
        return this.stream;
    },

    getStatus() {
        return this.status;
    },

    getHeaders() {
        return this.headers;
    },

    ok() {
        return 200 <= this.getStatus() && this.getStatus() < 300;
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            stream: proxy.stream,
            status: proxy.status,
            headers: proxy.headers,
        };
    },
};
