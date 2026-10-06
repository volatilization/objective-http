const endpoint = require('./endpoint');
const { endpoints, routeMapEndpoints } = require('./many');
const { chunkEndpoint } = require('./chunk');

module.exports = {
    endpoint,
    many: {
        endpoints: { ...endpoint, ...endpoints },
        routeMapEndpoints: { ...endpoint, ...routeMapEndpoints },
    },
    chunk: {
        chunkEndpoint: { ...endpoint, ...chunkEndpoint },
    },
};
