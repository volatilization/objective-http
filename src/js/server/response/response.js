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

    send() {
        try {
            this.getStream().writeHead(this.getStatus(), this.getHeaders());

            return this;
        } finally {
            this.getStream().end();
        }
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
