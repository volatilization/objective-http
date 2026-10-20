module.exports = {
    getBody() {
        return this.body;
    },

    getHeaders() {
        return {
            ...this.getOrigin().getHeaders(),
            'content-length': this.getBody()
                ? Buffer.byteLength(this.getBody())
                : 0,
        };
    },

    send() {
        try {
            this.getStream().writeHead(this.getStatus(), this.getHeaders());

            if (this.getBody()) {
                this.getStream().write(this.getBody());
            }

            return this;
        } finally {
            this.getStream().end();
        }
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            body: proxy.body,
        };
    },
};
