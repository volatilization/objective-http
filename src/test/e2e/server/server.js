/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const http = require('node:http');
const console = require('node:console');
const {
    Server,
    handler: {
        endpoint: {
            EndpointHandler,
            EndpointsHandler,
            EndpointHandlers,
            EndpointRequiredHandler,
        },
        error: {
            LogErrorHandler,
            UnexpectedErrorHandler,
            InvalidRequestErrorHandler,
            HandlerNotFoundErrorHandler,
        },
    },
    request: {
        chunk: { JsonServerRequest, ChunkServerRequest },
    },
    response: {
        chunk: { JsonServerResponse, ChunkServerResponse },
    },
} = require('../../../js').server;

const serverConfig = new Server({
    handler: new UnexpectedErrorHandler({
        origin: new LogErrorHandler({
            origin: new InvalidRequestErrorHandler({
                origin: new HandlerNotFoundErrorHandler({
                    origin: new EndpointRequiredHandler({
                        origin: new EndpointHandlers({
                            handlers: [
                                new EndpointHandler({
                                    endpoint: {
                                        route: {
                                            method: 'GET',
                                            path: '/error',
                                        },

                                        handle() {
                                            throw new Error('WTF');
                                        },
                                    },
                                    request: new ChunkServerRequest({}),
                                    response: new ChunkServerResponse({}),
                                }),
                                new EndpointHandler({
                                    endpoint: {
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
                                    request: new ChunkServerRequest({}),
                                    response: new ChunkServerResponse({}),
                                }),
                                new EndpointsHandler({
                                    endpoints: [
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
                                        {
                                            route: {
                                                method: 'POST',
                                                path: '/not/a/json/test',
                                            },

                                            handle(request) {
                                                return {
                                                    status: 200,
                                                    body: request.body.toString(),
                                                };
                                            },
                                        },
                                    ],
                                    request: new JsonServerRequest({
                                        origin: new ChunkServerRequest({}),
                                    }),
                                    response: new JsonServerResponse({
                                        origin: new ChunkServerResponse({}),
                                    }),
                                }),
                            ],
                        }),
                    }),
                    response: new ChunkServerResponse({}),
                }),
                response: new ChunkServerResponse({}),
            }),
            logger: console,
        }),
        response: new ChunkServerResponse({}),
    }),

    options: { port: 8080 },
    http,
});

describe('server', async () => {
    let serverInstance;
    before(async () => {
        serverInstance = await serverConfig.start();
    });
    after(async () => await serverInstance.stop());

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
