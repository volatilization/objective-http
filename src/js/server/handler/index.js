class EndpointHandler {
    #endpoint;
    #requset;
    #response;

    constructor({endpoint, requset, response}) {
        this.#endpoint = endpoint;
        this.#requset = requset;
        this.#response = response;
    }

    async handle(requsetStream, responseStream) {
        const requset = await this.#requset.with({
            requsetStream
        }).accept();

        if (JSON.stringify(requset.route) !== JSON.stringify(this.#endpoint.route)) {
            return;
        }

        return this.#response.with({
            responseStream,
            ...(await  this.#endpoint.handle(requset))
        }).send()
    }
}

class EndpointsHandler {
    #endpoints;
    #routeToEndpointMap;
    #requset;
    #response;
   
    constructor({
        endpoints, 
        routeToEndpointMap = new Map(endpoints.map((endpoint) => [JSON.stringify(endpoint.route), endpoint ])), 
        requset, 
        response
    }) {
        this.#endpoints = endpoints;
        this.#routeToEndpointMap = routeToEndpointMap;
        this.#requset = requset;
        this.#response = response;
    }

    async handle(requsetStream, responseStream) {
        const requset = await this.#requset.with({
            requsetStream
        }).accept();

        if (!this.#routeToEndpointMap.has(JSON.stringify(requset.route))) {
            throw new Error(`Handler for ${requset.route} not found`, { cause: {code: 'HANDLER_NOT_FOUND'} })
        }

        return this.#response.with({
            responseStream,
            ...(await  this.#routeToEndpointMap.get(JSON.stringify(requset.route)).handle(requset))
        }).send()
    }
}

class EndpointHandlers {
    #handlers;

    constructor({ handlers }) {
        this.#handlers = handlers;
    }

    async handle(requsetStream, responseStream) {
        return this.#handlers.reduce(async (response, handler) => {
            if (response != null) {
                return response;
            }

            await handler.handle(requsetStream, responseStream)
        }, undefined);
    }
}

class EndpontRequiredHandler {
    #origin;

    constructor({origin}) {
        this.#origin = origin;
    }

    async handle(requsetStream, responseStream) {
        const response = this.#origin.handle(requsetStream, responseStream);

        if (response == null) {
            throw new Error(`Handler for ${URL.parse(requsetStream).pathname} not found`, { cause: {code: 'HANDLER_NOT_FOUND'} })
        }

        return response;
    }
}

class InvalidRequestErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            if (e.cause.code !== 'INVALID_REQUEST') {
                throw e;
            }

            return this.#response.with({
                responseStream,
                status: 400,
                message: e.message,
            }).send();
        }
    }
}

class HandlerNotFoundErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            if (e.cause.code !== 'HANDLER_NOT_FOUND') {
                throw e;
            }

            return this.#response.with({
                responseStream,
                status: 501,
                message: e.message,
            }).send();
        }
    }
}

class UnexpectedErrorHandler {
    #origin;
    #response;

    constructor({ origin, response }) {
        this.#origin = origin;
        this.#response = response;
    }

    handle(requsetStream, responseStream) {
        try {
            return this.#origin.handle(requsetStream, responseStream);
        } catch (e) {
            return this.#response.with({
                responseStream,
                status: 500,
                message: 'Application unexpected error',
            }).send();
        }
    }
}
