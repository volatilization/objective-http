/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const {
    server,
    endpoint: {
        endpoint,
        many: { endpoints, routeMapEndpoints },
        chunk: { chunkEndpoint },
    },
    request: {
        serverRequest,
        chunk: { serverChunkRequest, serverJsonChunkRequest },
    },
    response: {
        serverResponse,
        chunk: {
            serverChunkResponse,
            serverJsonChunkResponse,
            error: { serverErrorResponse, serverStatusMapErrorResponse },
        },
    },
} = require('../../src/js/server');

const testedChunkRequest = { ...serverChunkRequest, origin: serverRequest };
const testedJsonChunkRequset = {
    ...serverJsonChunkRequest,
    origin: testedChunkRequest,
};
const testedChunkResponse = { ...serverChunkResponse, origin: serverResponse };
const testedJsonChunkResponse = {
    ...serverJsonChunkResponse,
    origin: testedChunkResponse,
};
const testedErrorResponse = {
    ...serverStatusMapErrorResponse,
    origin: { ...serverErrorResponse, origin: testedChunkResponse },
    statusMap: {
        get(error) {
            if (error.cause?.code === 'ENDPOINT_NOT_IMPLEMENTED') {
                return 501;
            }

            if (error.cause?.code === 'INVALID_REQUEST') {
                return 400;
            }

            return 500;
        },
    },
};

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
        getRoute() {
            return {
                method: 'GET',
                path: '/test',
            };
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

const testedEndpoints = {
    ...routeMapEndpoints,

    origin: { ...endpoints, origin: endpoint },

    request: serverRequest,
    response: serverResponse,
    collection: []
        .concat(
            chunkEndpoints.map((endpoint) => {
                return {
                    ...chunkEndpoint,
                    request: testedChunkRequest,
                    response: testedChunkResponse,
                    implementation: endpoint,
                };
            }),
        )
        .concat(
            jsonEndpoints.map((endpoint) => {
                return {
                    ...chunkEndpoint,
                    request: testedJsonChunkRequset,
                    response: testedJsonChunkResponse,
                    implementation: endpoint,
                };
            }),
        ),
}.init();

const testedServer = {
    ...server,
    endpoint: testedEndpoints,
    errorResponse: testedErrorResponse,
    options: { port: 8080 },
    http: require('node:http'),
};

describe('server', async () => {
    let s;
    before(async () => {
        s = await testedServer.start();
    });
    after(async () => {
        await s.stop();
    });

    await it('should be started', async () => {
        await assert.doesNotReject(() => fetch('http://localhost:8080'), {
            message: 'fetch failed',
        });
    });

    await it('should return 501', async () => {
        const response = await fetch('http://localhost:8080/not/a/test');

        assert.strictEqual(response.status, 501);
    });

    await it('should return 500', async () => {
        const response = await fetch('http://localhost:8080/error');

        assert.strictEqual(response.status, 500);
    });

    await it('should return 200 and query in body', async () => {
        const response = await fetch('http://localhost:8080/json/test?x=x0');
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
