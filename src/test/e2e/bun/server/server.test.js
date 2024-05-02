/* node:coverage disable */

const {describe, test, beforeAll, afterAll} = require('bun:test');
const assert = require('node:assert');

const createServerFunction = require('../../../../js').bun.bunttp.createServer;
const {
    Server,
    Endpoints,
    InputRequest,
    OutputResponse
} = require('../../../../js').bun.server;

const testBody = {value: 'value', queryValue: 'otherQueryValue'};

const serverConfig = new Server(
    new Endpoints([
        {
            route() {
                return {
                    method: 'GET',
                    path: '/test'
                };
            },
            handle(request) {
                return {
                    statusCode: 200,
                    body: request.query().get('queryKey')
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
            handle(request) {
                return {
                    statusCode: 201,
                    body: request.body().toString()
                };
            }
        },
    ]),
    {port: 8080},
    new InputRequest(),
    new OutputResponse(),
    createServerFunction
);


describe('server', async () => {
    let serverInstance;
    beforeAll(async () => {
        serverInstance = await serverConfig.start();
    })
    afterAll(async () => await serverInstance.stop());

    await test('should be started', async () => {
        await assert.doesNotReject(() => fetch('http://localhost:8080'),
            {message: 'fetch failed'});
    });

    await test('should return 501', async () => {
        const response = await fetch('http://localhost:8080/test0',
            {method: 'GET'});
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 501);
        assert.strictEqual(body, 'There are no handler for request.');
    });

    await test('should return 200 and queryValue in body', async () => {
        const response = await fetch('http://localhost:8080/test?queryKey=queryValue',
            {method: 'GET'});
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(body, 'queryValue');
    });

    await test('should return 201 and test body', async () => {
        const response = await fetch('http://localhost:8080/test?queryKey=queryValue',
            {
                method: 'POST',
                body: JSON.stringify(testBody),
            });
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(body, JSON.stringify(testBody));
    });
});