module.exports = Object.freeze({
    stream: undefined,
    route() {
        return {
            method: this.stream.method,
            path: new URL(`http://localhost${this.stream.url}`).pathname,
        };
    },
});
