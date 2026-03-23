/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const http = require('node:http');
const {
    request: {
        chunk: { ChunkClientRequest },
    },
    response: {
        chunk: { ChunkClientResponse },
    },
} = require('../../../js').client;
const {
    Server,
    handler: {
        endpoint: { EndpointsHandler },
        error: {
            UnexpectedErrorHandler,
            InvalidRequestErrorHandler,
            HandlerNotFoundErrorHandler,
        },
    },
    request: {
        chunk: { ChunkServerRequest },
    },
    response: {
        chunk: { ChunkServerResponse },
    },
} = require('../../../js').server;

const serverConfig = new Server({
    handler: new UnexpectedErrorHandler({
        origin: new InvalidRequestErrorHandler({
            origin: new HandlerNotFoundErrorHandler({
                origin: new EndpointsHandler({
                    endpoints: [
                        {
                            route: {
                                method: 'GET',
                                path: '/test',
                            },

                            handle() {
                                return {
                                    status: 200,
                                };
                            },
                        },
                        {
                            route: {
                                method: 'POST',
                                path: '/test',
                            },

                            handle() {
                                return {
                                    status: 201,
                                    body: 'test body',
                                };
                            },
                        },
                        {
                            route: {
                                method: 'GET',
                                path: '/error',
                            },

                            handle() {
                                throw new Error('WTF');
                            },
                        },
                    ],
                    request: new ChunkServerRequest({}),
                    response: new ChunkServerResponse({}),
                }),
                response: new ChunkServerResponse({}),
            }),
            response: new ChunkServerResponse({}),
        }),
        response: new ChunkServerResponse({}),
    }),

    options: { port: 8090 },
    http,
});
const request = new ChunkClientRequest({
    http: http,
    response: new ChunkClientResponse({}),
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

    await it('should return 200 and no body', async () => {
        const response = await request
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'GET',
                    path: '/test',
                },
            })
            .send();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.length, 0);
    });

    await it('should return 201 and test body', async () => {
        const response = await request
            .with({
                options: {
                    host: 'localhost',
                    port: 8090,
                    method: 'POST',
                    path: '/test',
                },
                body: 'test body',
            })
            .send();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.toString(), 'test body');
    });
});
