/* node:coverage disable */

const {describe, test, beforeAll, afterAll} = require('bun:test');
const assert = require('node:assert');
const http = require('node:http');

const {
    OutputRequest,
    InputResponse
} = require('../../../../js/index').client;

const {
    Server,
    InputRequest,
    OutputResponse,
    Endpoints
} = require('../../../../js').server;

const serverConfig = new Server(
    new Endpoints([
        {
            route() {
                return {
                    method: 'GET',
                    path: '/test'
                };
            },
            handle() {
                return {
                    statusCode: 200
                };
            }
        },
        {
            route() {
                return {
                    method: 'POST',
                    path: '/test'
                };
            },
            handle() {
                return {
                    statusCode: 201,
                    body: 'test body'
                };
            }
        },
    ]),
    {port: 8090},
    new InputRequest(),
    new OutputResponse(),
    http
);

describe('client', async () => {
    let serverInstance;
    beforeAll(async () => {
        serverInstance = await serverConfig.start();
    });
    afterAll(async () => await serverInstance.stop());

    await test('should be started', async () => {
        await assert.doesNotReject(() =>
                new OutputRequest(http, new InputResponse(), {
                    url: 'http://localhost', method: 'GET', port: '8090'
                }).send(),
            {message: 'fetch failed'});

        await assert.doesNotReject(() =>
                new OutputRequest(http, new InputResponse(), {
                    port: '8090', method: 'GET', host: 'localhost'
                }).send(),
            {message: 'fetch failed'});
    });

    await test('should return 501', async () => {
        const response = await new OutputRequest(http, new InputResponse(), {
            url: 'http://localhost:8090/no_test', method: 'GET'
        }).send();

        assert.strictEqual(response.statusCode(), 501);
        assert.strictEqual(response.body().toString(), 'There are no handler for request.');
    });

    await test('should return 200 and no body', async () => {
        const response = await new OutputRequest(http, new InputResponse(), {
            url: 'http://localhost:8090/test', method: 'GET'
        }).send();

        assert.strictEqual(response.statusCode(), 200);
        assert.strictEqual(response.body().length, 0);
    });

    await test('should return 201 and test body', async () => {
        const response = await new OutputRequest(http, new InputResponse(), {
            url: 'http://localhost:8090/test', method: 'POST', body: 'test body'
        }).send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });

    await test('should not fall, but body is not a string', async () => {
        const response = await new OutputRequest(http, new InputResponse(), {
            url: 'http://localhost:8090/test', method: 'POST', body: {}
        }).send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });
});