/* node:coverage disable */

const {describe, test, beforeAll, afterAll} = require('bun:test');
const assert = require('node:assert');


const createServerFunction =
    // require('node:http').createServer;
    require('../../../../js').bun.bunttp.createServer;
const requestFunction  =
    // require('node:http').request;
    require('../../../../js').bun.bunttp.request;
const {
    OutputRequest,
    InputResponse
} = require('../../../../js')
    .bun
    .client;
const {
    Server,
    Endpoints,
    InputRequest,
    OutputResponse,
} = require('../../../../js')
    .bun
    .server;

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
    createServerFunction
);

const request = new OutputRequest(new InputResponse(), requestFunction);

describe('client', async () => {
    let serverInstance;
    beforeAll(async () => {
        serverInstance = await serverConfig.start();
    });
    afterAll(async () => await serverInstance.stop());

    await test('should be started', async () => {
        await assert.doesNotReject(() =>
                request.copy( {
                    url: 'http://localhost:8090', method: 'GET'
                }).send(),
            {message: 'fetch failed'});
    });

    await test('should return 501', async () => {
        const response = await (request.copy( {
            url: 'http://localhost:8090/no_test', method: 'GET'
        })).send();

        assert.strictEqual(response.statusCode(), 501);
        assert.strictEqual(response.body().toString(), 'There are no handler for request.');
    });

    await test('should return 200 and no body', async () => {
        const response =  await (request.copy( {
            url: 'http://localhost:8090/test', method: 'GET'
        })).send();

        assert.strictEqual(response.statusCode(), 200);
        assert.strictEqual(response.body().length, 0);
    });

    await test('should return 201 and test body', async () => {
        const response =  await (request.copy( {
            url: 'http://localhost:8090/test', method: 'POST', body: 'test body'
        })).send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });

    await test('should not fall, but body is not a string', async () => {
        const response =  await (request.copy( {
            url: 'http://localhost:8090/test', method: 'POST', body: {}
        })).send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });
});