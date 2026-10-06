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

    ok() {
        return 200 <= this.getStatus() && this.getStatus() < 300;
    },
});
