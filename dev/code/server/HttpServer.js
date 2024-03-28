class HttpServer {
    #http;
    #endpoints;
    #config;
    #logger;

    constructor(http, endpoints, config, logger = console) {
        this.#http = http;
        this.#endpoints = endpoints;
        this.#config = config;
        this.#logger = logger;
    }

    start() {
        const routeMap = this.#registerRoutes();

        this.#http
            .createServer(async (request, response) => {
                const method = request.method.toString().toUpperCase();
                const path = new URL(`http://localhost${request.url}`).pathname.toString().toLowerCase();

                this.#logger.debug(`New HTTP request ${method} ${path}.`);

                request.on('error', (e) => {
                    response.statusCode = 500;
                    response.write('Server error.');
                    response.end();

                    this.#logger.error(`Unexpected HTTP request ${method} ${path} error.`, e);
                });

                if (!routeMap.has(method) || !routeMap.get(method).has(path)) {
                    response.statusCode = 501;
                    response.write('There are no handler for request.');
                    response.end();

                    this.#logger.debug(`There are no handler for HTTP request ${method} ${path}.`);
                    return;
                }

                try {
                    await routeMap.get(method).get(path).listen(request, response);

                    this.#logger.debug(`HTTP request ${request.method} ${request.url} successfully ended.`);

                } catch (e) {
                    this.#logger.error(`HTTP request ${request.method} ${request.url} ended with error.`, e);
                }

                response.end();
            })
            .listen({port: this.#config.port}, () => {

                this.#logger.debug(`HTTP requests are listened on ${this.#config.port}.`);
            });
    }

    #registerRoutes() {
        const routeMap = new Map();
        this.#endpoints.forEach(endpoint => {
            const route = endpoint.route();

            if (!routeMap.has(route.method)) {
                routeMap.set(route.method, new Map())
            }

            if (!routeMap.get(route.method).has(route.path)) {
                routeMap.get(route.method).set(route.path, endpoint);
            }
        });

        return routeMap;
    }
}

module.exports = HttpServer;