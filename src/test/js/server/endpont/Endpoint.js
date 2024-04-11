/* node:coverage disable */

const {Endpoint} = require('../../../../js/index').server;
const {describe, it} = require('node:test');
const assert = require('node:assert');

const testRoute = {
    method: 'method',
    path: 'path'
};

describe('Endpoint', () => {
    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Endpoint();
                new Endpoint(testRoute.method, null);
                new Endpoint(null, testRoute.path);
                new Endpoint(testRoute.method, testRoute.path);
            });
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Endpoint().copy();
                new Endpoint().copy(testRoute.method);
                new Endpoint().copy(null, testRoute.path);
                new Endpoint().copy(testRoute.method, testRoute.path);
            });
        });

        it('should return new Endpoint instance', () => {
            const endpoint = new Endpoint();
            const copyEndpoint = endpoint.copy();

            assert.notEqual(endpoint, copyEndpoint);
            assert.strictEqual(typeof copyEndpoint, typeof endpoint);
        });
    });

    describe('route', () => {
        it('should fall, cause method is null', () => {
            assert.throws(() => new Endpoint(null, testRoute.path).route(),
                {name: 'TypeError'});
        });

        it('should fall, cause path is null', () => {
            assert.throws(() => new Endpoint(testRoute.method, null).route(),
                {name: 'TypeError'});
        });

        it('should return method name in upper case', () => {
            const resultRoute = new Endpoint(testRoute.method, testRoute.path).route();

            assert.deepStrictEqual(resultRoute.method, resultRoute.method.toUpperCase());
        });

        it('should return path name in lower case', () => {
            const resultRoute = new Endpoint(testRoute.method, testRoute.path).route();

            assert.deepStrictEqual(resultRoute.path, resultRoute.path.toLowerCase());
        });
    });

    describe('handle', () => {
        it('should return {}', async () => {
            const result = await new Endpoint().handle();

            assert.deepStrictEqual(result, {});
        });
    });
});