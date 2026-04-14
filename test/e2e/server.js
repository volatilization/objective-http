/* node:coverage disable */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

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
];

function errorHandlers() {
    return ({ origin }) => {
        return {
            async handle(requestStream, responseStream) {
                console.log('INSIDE');
                return await origin.handle(requestStream, responseStream);
            },
        };
    };
}

const serverConfig = server({
    endpoints,
    errorHandler: errorHandlers(),
    env: { SERVER_PORT: 8080, SERVER_ERROR_LOG: true },
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
