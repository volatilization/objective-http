/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const http = require('node:http');

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
            console.log(body);

            return {
                status: 201,
                body: body,
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
    options: { port: 8090 },
    http,
};

const {
    request: {
        chunk: { clientChunkRequest, clientJsonRequest },
    },
    response: {
        chunk: { clientChunkResponse, clientJsonResponse },
    },
} = require('../../src/js/client');

const testedRequest = {
    ...clientChunkRequest,
    response: clientChunkResponse,
    http: http,
};
const testedJsonRequest = {
    ...clientJsonRequest,
    response: clientJsonResponse,
    http: http,
};

describe('client', async () => {
    let serverInstance;
    before(async () => {
        serverInstance = await testedServer.start();
    });
    after(async () => {
        await serverInstance.stop();
    });

    await it('should be started', async () => {
        await assert.doesNotReject(
            () => {
                return {
                    ...testedRequest,
                    url: 'http://localhost:8090',
                }.send();
            },
            { message: 'fetch failed' },
        );

        try {
            await {
                ...testedRequest,
                url: 'http://localhost:8091',
            }.send();
        } catch (e) {
            assert.strictEqual(e.cause.code, 'REQUEST_ERROR');
        }
    });

    await it('should return 500', async () => {
        const response = await {
            ...testedRequest,
            url: 'http://localhost:8090/error',
        }.send();

        assert.strictEqual(response.status, 500);
    });

    await it('should return 501', async () => {
        const response = await {
            ...testedRequest,
            url: 'http://localhost:8090/not_a_test',
        }.send();

        assert.strictEqual(response.status, 501);
        assert.equal(response.ok(), false);
    });

    await it('should return 200 and query as body', async () => {
        const response = await {
            ...testedJsonRequest,
            url: 'http://localhost:8090/json/test?x=x0',
        }.send();

        assert.strictEqual(response.status, 200);
        assert.equal(response.ok(), true);
        assert.deepEqual(response.body, { x: 'x0' });
    });

    await it('should return 201 and sended body', async () => {
        const response = await {
            ...testedJsonRequest,
            url: 'http://localhost:8090/json/test',
            options: {
                method: 'POST',
            },
            body: { y: 'y0' },
        }.send();

        assert.strictEqual(response.status, 201);
        assert.equal(response.ok(), true);
        assert.deepEqual(response.body, { y: 'y0' });
        assert.strictEqual(
            response.headers?.['content-type'],
            'application/json',
        );
        assert.strictEqual(response.headers?.['content-length'], '10');
    });
});
