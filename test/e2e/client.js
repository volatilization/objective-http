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

const testedServerChunkRequest = {
    ...serverChunkRequest,
    origin: serverRequest,
};
const testedServerJsonChunkRequset = {
    ...serverJsonChunkRequest,
    origin: testedServerChunkRequest,
};
const testedServerChunkResponse = {
    ...serverChunkResponse,
    origin: serverResponse,
};
const testedServerJsonChunkResponse = {
    ...serverJsonChunkResponse,
    origin: testedServerChunkResponse,
};
const testedServerErrorResponse = {
    ...serverStatusMapErrorResponse,
    origin: { ...serverErrorResponse, origin: testedServerChunkResponse },
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
                    request: testedServerChunkRequest,
                    response: testedServerChunkResponse,
                    implementation: endpoint,
                };
            }),
        )
        .concat(
            jsonEndpoints.map((endpoint) => {
                return {
                    ...chunkEndpoint,
                    request: testedServerJsonChunkRequset,
                    response: testedServerJsonChunkResponse,
                    implementation: endpoint,
                };
            }),
        ),
}.init();

const testedServer = {
    ...server,
    endpoint: testedEndpoints,
    errorResponse: testedServerErrorResponse,
    options: { port: 8090 },
    http: require('node:http'),
};

const {
    request: {
        clientRequest,
        chunk: { clientChunkRequest, clientJsonChunkRequest },
    },
    response: {
        clientResponse,
        chunk: { clientChunkResponse, clientJsonChunkResponse },
    },
} = require('../../src/js/client');

const testedClientChunkResponse = {
    ...clientChunkResponse,
    origin: clientResponse,
};
const testedClientChunkRequest = {
    ...clientChunkRequest,
    origin: clientRequest,
    response: testedClientChunkResponse,
    http: require('node:http'),
};
const testedClientJsonChunkResponse = {
    ...clientJsonChunkResponse,
    origin: testedClientChunkResponse,
};
const testedClientJsonChunkRequest = {
    ...clientJsonChunkRequest,
    origin: testedClientChunkRequest,
    response: testedClientJsonChunkResponse,
    http: require('node:http'),
};

describe('client', async () => {
    let s;
    before(async () => {
        s = await testedServer.start();
    });
    after(async () => {
        await s.stop();
    });

    await it('should be started', async () => {
        try {
            await {
                ...testedClientChunkRequest,
                url: 'http://localhost:8091',
            }.send();
        } catch (e) {
            assert.strictEqual(e.cause.code, 'REQUEST_ERROR');
        }
    });

    await it('should return 500', async () => {
        const response = await {
            ...testedClientChunkRequest,
            url: 'http://localhost:8090/error',
        }.send();

        assert.strictEqual(response.getStatus(), 500);
    });

    await it('should return 501', async () => {
        const response = await {
            ...testedClientChunkRequest,
            url: 'http://localhost:8090/not_a_test',
        }.send();

        assert.strictEqual(response.getStatus(), 501);
        assert.equal(response.ok(), false);
    });

    await it('should return 200 and query as body', async () => {
        const response = await {
            ...testedClientJsonChunkRequest,
            url: 'http://localhost:8090/json/test?x=x0',
        }.send();

        assert.strictEqual(response.getStatus(), 200);
        assert.equal(response.ok(), true);
        assert.deepEqual(response.getBody(), { x: 'x0' });
    });

    await it('should return 201 and sended body', async () => {
        const response = await {
            ...testedClientJsonChunkRequest,
            url: 'http://localhost:8090/json/test',
            options: {
                method: 'POST',
            },
            body: { y: 'y0' },
        }.send();

        assert.strictEqual(response.getStatus(), 201);
        assert.equal(response.ok(), true);
        assert.deepEqual(response.getBody(), { y: 'y0' });
        assert.strictEqual(
            response.getHeaders()?.['content-type'],
            'application/json',
        );
        assert.strictEqual(response.getHeaders()?.['content-length'], '10');
    });
});
