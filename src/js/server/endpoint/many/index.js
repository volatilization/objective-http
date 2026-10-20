const endpoints = require('./endpoints');
const routeMapEndpoints = require('./routeMapEndpoints');

module.exports = {
    endpoints,
    routeMapEndpoints: { ...endpoints, ...routeMapEndpoints },
};
