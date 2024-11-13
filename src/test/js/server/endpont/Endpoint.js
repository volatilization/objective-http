/* node:coverage disable */

const {describe, it} = require('node:test');
const assert = require('node:assert');

const {Endpoint} = require('../../../../js').server.endpoint;


const testRoute = {
    method: 'method',
    path: 'path'
};

describe('Endpoint', () => {
    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Endpoint();
                new Endpoint({method: testRoute.method, path: null});
                new Endpoint({method: null, path: testRoute.path});
                new Endpoint(testRoute);
            });
        });
    });

    describe('route', () => {
        it('should return route', () => {
            const resultRoute = new Endpoint(testRoute).route();

            assert.deepStrictEqual(testRoute, resultRoute);
        });
    });

    describe('handle', () => {
        it('should return {}', async () => {
            const result = await new Endpoint().handle();

            assert.deepStrictEqual(result, {statusCode: 200});
        });
    });
});