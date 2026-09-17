module.exports = Object.freeze({
    stream: undefined,
    status: undefined,
    headers: undefined,

    ok() {
        return 200 <= this.status && this.status < 300;
    },
});
