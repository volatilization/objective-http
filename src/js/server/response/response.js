module.exports = Object.freeze({
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
});
