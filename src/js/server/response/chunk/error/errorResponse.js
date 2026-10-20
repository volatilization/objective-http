module.exports = {
    getStatus() {
        return this.getOrigin().getStatus() ?? 500;
    },

    getHeaders() {
        return {
            ...this.getOrigin({ ...this, body: this.getBody() }).getHeaders(),
            'content-type': 'text/plain',
        };
    },

    getBody() {
        return this.getError().message;
    },

    getError() {
        return this.error;
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            error: proxy.error,
        };
    },
};
