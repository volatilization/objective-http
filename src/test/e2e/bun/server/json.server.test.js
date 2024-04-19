/* node:coverage disable */

const {describe, test, beforeAll, afterAll} = require('bun:test');
const assert = require('node:assert');

const http = require('../../../../js').bun.bunttp;
const {
    Server,
    JsonInputRequest,
    JsonOutputResponse,
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
                    body: JSON.stringify({queryKey: request.query().get('queryKey')})
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
                    body: request.body()
                };
            }
        },
    ]),
    {port: 8081},
    new JsonInputRequest(new InputRequest()),
    new JsonOutputResponse(new OutputResponse()),
    http
);


describe('JSON server', async () => {
    let serverInstance;
    beforeAll(async () => {
        serverInstance = await serverConfig.start();
    });
    afterAll(async () => await serverInstance.stop());

    await test('should be started', async () => {
        await assert.doesNotReject(() => fetch('http://localhost:8081'),
            {message: 'fetch failed'});
    });

    await test('should return 501', async () => {
        const response = await fetch('http://localhost:8081/test0',
            {method: 'GET'});
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 501);
        assert.strictEqual(body, 'There are no handler for request.');
    });

    await test('should return 200 and queryValue in body', async () => {
        const response = await fetch('http://localhost:8081/test?queryKey=queryValue',
            {method: 'GET'});
        const body = await response.json();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.headers.get('Content-Type').includes('application/json'), true);
        assert.deepStrictEqual(body, {queryKey: 'queryValue'});
    });

    await test('should return 400, cause content-type is not application/json', async () => {
        const response = await fetch('http://localhost:8081/test',
            {
                method: 'POST',
                headers: {'content-type': 'application/notJson'}
            });
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 400);
        assert.strictEqual(body, 'Wrong content-type. Only application/json accepted.');
    });

    await test('should return 400, cause content-type is not set', async () => {
        const response = await fetch('http://localhost:8081/test',
            {method: 'POST'});
        const body = await (await response.blob()).text();

        assert.strictEqual(response.status, 400);
        assert.strictEqual(body, 'Wrong content-type. Only application/json accepted.');
    });

    await test('should return 201 and test body', async () => {
        const response = await fetch('http://localhost:8081/test?queryKey=queryValue',
            {
                method: 'POST',
                body: JSON.stringify(testBody),
                headers: {'content-type': 'application/json'}
            });
        const body = await response.json();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.headers.get('Content-Type').includes('application/json'), true);
        assert.deepStrictEqual(body, testBody);
    });
});