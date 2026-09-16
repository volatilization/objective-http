const response = require('../response');

module.exports = Object.freeze({
    ...response,

    origin: response,
    body: undefined,

    send() {
        try {
            this.stream.writeHead(this.status, {
                ...this.headers,
                'content-length': this.body ? Buffer.byteLength(this.body) : 0,
            });

            if (this.body) {
                this.stream.write(this.body);
            }

            return this;
        } finally {
            this.stream.end();
        }
    },
});
