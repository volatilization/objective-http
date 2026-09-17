module.exports = Object.freeze({
    stream: undefined,
    status: undefined,
    headers: undefined,

    send() {
        try {
            this.stream.writeHead(this.status, this.headers);

            return this;
        } finally {
            this.stream.end();
        }
    },
});
