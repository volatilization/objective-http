const errorResponse = require('./errorResponse');

module.exports = Object.freeze({
    ...errorResponse,

    getStatus() {
        return this.statusMap.get(this.getError());
    },
});
