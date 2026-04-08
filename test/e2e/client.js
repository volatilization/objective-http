/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const http = require('node:http');
const {
    request: {
        chunk: { JsonClientRequest, ChunkClientRequest },
    },
    response: {
        chunk: { JsonClientResponse, ChunkClientResponse },
    },
} = require('../../src/js/index').client;

const { server } = require('../../src/js/index').server.autoconfig;

const endpoints = [
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
    [
        {
            route: {
                method: 'GET',
                path: '/json/test',
            },

            handle(request) {
                return {
                    status: 200,
                    body: request.query,
                };
            },
        },
        {
            route: {
                method: 'POST',
                path: '/json/test',
            },

            handle(request) {
                return {
                    status: 201,
                    body: request.body,
                };
            },
        },
    ],
];

const serverConfig = server({
    endpoints,
    env: { SERVER_PORT: 8090, SERVER_LOG_ENABLE: true },
});
const request = new ChunkClientRequest({
    http: http,
    response: new ChunkClientResponse({}),
});
const jsonRequest = new JsonClientRequest({
    origin: request.with({
        response: new JsonClientResponse({
            origin: request.response,
        }),
    }),
});
describe('client', async () => {
    let serverInstance;
    before(async () => {
        serverInstance = await serverConfig.start();
    });
    after(async () => {
        await serverInstance.stop();
    });

    await it('should be started', async () => {
        await assert.doesNotReject(
            () =>
                request
                    .with({
                        options: {
                            host: 'localhost',
                            port: 8090,
                            method: 'GET',
                        },
                    })
                    .send(),
            { message: 'fetch failed' },
        );

        try {
            await request
                .with({
                    options: {
                        host: 'localhost',
                        port: 8091,
                        method: 'GET',
                    },
                })
                .send();
        } catch (e) {
            assert.strictEqual(e.cause.code, 'REQUEST_ERROR');
        }
    });

    await it('should return 500', async () => {
        const response = await request
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'GET',
                    path: '/error',
                },
            })
            .send();

        assert.strictEqual(response.status, 500);
    });

    await it('should return 501', async () => {
        const response = await request
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'GET',
                    path: '/not_a_test',
                },
            })
            .send();

        assert.strictEqual(response.status, 501);
    });

    await it('should return 200 and query as body', async () => {
        const response = await jsonRequest
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'GET',
                    path: '/json/test?x=x0',
                },
            })
            .send();

        assert.strictEqual(response.status, 200);
        assert.deepEqual(response.body, { x: 'x0' });
    });

    await it('should return 201 and sended body', async () => {
        const response = await jsonRequest
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'POST',
                    path: '/json/test',
                },
                body: { y: 'y0' },
            })
            .send();

        assert.strictEqual(response.status, 201);
        assert.deepEqual(response.body, { y: 'y0' });
    });
});
