module.exports = class JsonEndpoint {
    #request;
    #response;
    #origin;

    constructor({ request, response, origin }) {
        this.#request = request;
        this.#response = response;
        this.#origin = origin;
    }

    get route() {
        return this.#origin.route;
    }

    async handle() {
        const request = await this.#request.accept();

        const result = await this.#origin.handle(request);

        const response = this.#response
            .with({
                status: result.status,
                headers: result.headers,
                body:
                    result.status === undefined && result.headers === undefined
                        ? result
                        : result.body,
            })
            .send();

        return this;
    }
};

class MyJsonEndpoint {
    #domain;

    constructor({ domain }) {
        this.#domain = domain;
    }

    get route() {
        return {
            method: 'POST',
            path: '/api',
        };
    }

    async handle({ headers, query, body }) {
        this.#domain.process(body);

        return {
            x: 123,
        };
    }
}

class Endpoints {
    request;
    response;
    collection;
    routeToEndpointMap = new Map(
        collection.map((endpoint) => [endpoint.route, endpoint]),
    );

    async handle() {
        if (!this.routeToEndpointMap.has(this.request.route)) {
            throw new Error(`Handler for ${this.#request.route} not found`, {
                cause: { code: 'HANDLER_NOT_FOUND' },
            });
        }

        const endpoint = this.#routeToEndpointMap.get(this.#request.route);

        await endpoint
            .with({
                request: endpoint.request.with({
                    stream: this.#request.stream,
                }),
                response: endpoint.response.with({
                    stream: this.#response.stream,
                }),
            })
            .handle();
    }
}

class ErrorResponse {
    #origin;
    #error;

    constructor({ origin, error }) {
        this.#origin = origin;
        this.#error = error;
    }

    with({
        stream,
        status,
        headers,
        body,
        origin = this.#origin.with({
            stream,
            status,
            headers,
            body,
        }),
        error = this.#error,
    }) {
        return new ErrorResponse({
            origin,
            error,
        });
    }

    get status() {
        return this.#origin.status ?? 500;
    }

    get headers() {
        return {
            ...this.#origin.headers,
            'content-length': Buffer.byteLength(this.body),
            'content-type': 'text/plain',
        };
    }

    get body() {
        return this.#origin.body ?? this.#error.message ?? '';
    }

    get error() {
        return this.#error;
    }

    send() {
        return this.with({
            origin: this.#origin
                .with({
                    status: this.status,
                    headers: this.headers,
                    body: this.body,
                })
                .send(),
        });
    }
}

class CustomErrorResponse {
    #origin;

    constructor({ origin }) {
        this.#origin = origin;
    }

    with({
        stream,
        status,
        headers,
        body,
        error,
        origin = this.#origin.with({
            stream,
            status,
            headers,
            body,
            error,
        }),
    }) {
        return new CustomErrorResponse({
            origin,
        });
    }

    get status() {
        if (this.error.cause?.code?.includes('NOT_FOUND')) {
            return 404;
        }

        return this.#origin.status;
    }

    get headers() {
        return this.#origin.headers;
    }

    get body() {
        return this.#origin.body;
    }

    get error() {
        return this.#origin.error;
    }

    send() {
        return this.with({
            origin: this.#origin
                .with({
                    status: this.status,
                })
                .send(),
        });
    }
}
