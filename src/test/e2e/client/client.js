/* node:coverage disable */

const {describe, it, before, after} = require('node:test');
const assert = require('node:assert');


const creatServerFunction = require('node:http').createServer;
const requestFunction = require('node:http').request;
const {
    request: {
        OutputRequest
    },
    response: {
        InputResponse
    }
} = require('../../../js').client;
const {
    Server,
    endpoint: {
        Endpoints
    },
    request: {
        InputRequest
    },
    response: {
        OutputResponse
    }
} = require('../../../js').server;

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
    creatServerFunction
);
const request = new OutputRequest(new InputResponse(), requestFunction);

describe('client', async () => {
    let serverInstance;
    before(async () => {
        serverInstance = await serverConfig.start();
    });
    after(async () => await serverInstance.stop());

    await it('should be started', async () => {
        await assert.doesNotReject(() =>
                request
                    .copy({
                        url: 'http://localhost', method: 'GET', port: '8090'})
                    .send(),
            {message: 'fetch failed'});

        await assert.rejects(() =>
                request
                    .copy({
                        port: '8091', method: 'GET', host: 'localhost'})
                    .send(),
            {cause: 'INVALID_REQUEST'});
    });

    await it('should return 501', async () => {
        const response = await (request
            .copy({
                url: 'http://localhost:8090/no_test', method: 'GET'}))
            .send();

        assert.strictEqual(response.statusCode(), 501);
        assert.strictEqual(response.body().toString(), 'There are no handler for request.');
    });

    await it('should return 200 and no body', async () => {
        const response = await (request
            .copy({
                url: 'http://localhost:8090/test', method: 'GET'}))
            .send();

        assert.strictEqual(response.statusCode(), 200);
        assert.strictEqual(response.body().length, 0);
    });

    await it('should return 201 and test body', async () => {
        const response = await (request
            .copy({
                url: 'http://localhost:8090/test', method: 'POST', body: 'test body'}))
            .send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });

    await it('should not fall, but body is not a string', async () => {
        const response = await (request
            .copy({
                url: 'http://localhost:8090/test', method: 'POST', body: {}}))
            .send();

        assert.strictEqual(response.statusCode(), 201);
        assert.strictEqual(response.body().toString(), 'test body');
    });
});