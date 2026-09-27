const errorResponse = require('./errorResponse');

module.exports = Object.freeze({
    ...errorResponse,

    statusMap: undefined,

    send() {
        ({
            ...errorResponse,
            stream: this.stream,
            status: {
                ...this.statusMap,
                error: this.error,
            }.status(),
            error: this.error,
        }).send();

        return this;
    },
});
