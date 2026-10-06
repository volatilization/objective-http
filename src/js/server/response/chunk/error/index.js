const errorResponse = require('./errorResponse');
const statusMapErrorResponse = require('./statusMapErrorResponse');

module.exports = {
    errorResponse,
    statusMapErrorResponse: { ...errorResponse, ...statusMapErrorResponse },
};
