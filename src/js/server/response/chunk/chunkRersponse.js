const response = require('../response');

module.exports = Object.freeze({
    ...response,

    getBody() {
        return this.body;
    },

    getHeaders() {
        return {
            ...this.headers,
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
});
