/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const {
    server,
    endpoint: {
        endpoints,
        chunk: { chunkEndpoint },
    },
    request: {
        serverRequest,
        chunk: { serverChunkRequest, serverJsonRequest },
    },
    response: {
        serverResponse,
        chunk: { serverChunkResponse, serverJsonResponse, serverErrorResponse },
    },
} = require('../../src/js/server');

const chunkEndpoints = [
    {
        route: {
            method: 'GET',
            path: '/error',
        },

        handle() {
            throw new Error('WTF');
        },
    },
    {
        route: {
            method: 'GET',
            path: '/test',
        },

        handle() {
            return {
                status: 200,
                body: 'success',
            };
        },
    },
];

const jsonEndpoints = [
    {
        route: {
            method: 'GET',
            path: '/json/test',
        },

        handle({ query }) {
            return {
                status: 200,
                body: query,
            };
        },
    },
    {
        route: {
            method: 'POST',
            path: '/json/test',
        },

        handle({ body }) {
            return {
                status: 201,
                body: body,
            };
        },
    },
    {
        route: {
            method: 'POST',
            path: '/not/a/json/test',
        },

        handle({ body }) {
            return {
                status: 200,
                body: body.toString(),
            };
        },
    },
];

const testedErrorResponse = {
    ...serverErrorResponse,
    origin: serverErrorResponse,
    send() {
        let status = 500;

        if (this.error.cause?.code === 'ENDPOINT_NOT_IMPLEMENTED') {
            status = 501;
        }

        if (this.error.cause?.code === 'INVALID_REQUEST') {
            status = 400;
        }

        ({
            ...this.origin,
            stream: this.stream,
            error: this.error,
            status: status,
        }).send();

        return this;
    },
};

const testedServer = {
    ...server,
    endpoints: {
        ...endpoints,
        request: serverRequest,
        response: serverResponse,
        collection: []
            .concat(
                chunkEndpoints.map((e) => {
                    return {
                        ...chunkEndpoint,
                        request: serverChunkRequest,
                        response: serverChunkResponse,
                        origin: e,
                    };
                }),
            )
            .concat(
                jsonEndpoints.map((e) => {
                    return {
                        ...chunkEndpoint,
                        request: serverJsonRequest,
                        response: serverJsonResponse,
                        origin: e,
                    };
                }),
            ),
    },
    errorResponse: testedErrorResponse,
    options: { port: 8080 },
    http: require('node:http'),
};

describe('server', async () => {
    let serverInstance;
    before(async () => {
        serverInstance = await testedServer.start();
    });
    after(async () => {
        await serverInstance.stop();
    });

    await it('should be started', async () => {
        await assert.doesNotReject(() => fetch('http://localhost:8080'), {
            message: 'fetch failed',
        });
    });

    await it('should return 501', async () => {
        const response = await fetch('http://localhost:8080/not/a/test', {
            method: 'GET',
        });

        assert.strictEqual(response.status, 501);
    });

    await it('should return 500', async () => {
        const response = await fetch('http://localhost:8080/error', {
            method: 'GET',
        });

        assert.strictEqual(response.status, 500);
    });

    await it('should return 200 and query in body', async () => {
        const response = await fetch('http://localhost:8080/json/test?x=x0', {
            method: 'GET',
        });
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(body, JSON.stringify({ x: 'x0' }));
    });

    await it('should return 400 cause not a json body', async () => {
        const response = await fetch(
            'http://localhost:8080/not/a/json/test?x=x0',
            {
                method: 'POST',
                body: 'not a real json',
            },
        );

        assert.strictEqual(response.status, 400);
    });

    await it('should return 201 and test body', async () => {
        const testBody = { x: 'x0', y: 'y0' };
        const response = await fetch('http://localhost:8080/json/test?z=z', {
            method: 'POST',
            body: JSON.stringify(testBody),
        });
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(body, JSON.stringify(testBody));
    });
});
