/* node:coverage disable */

const {LoggedEndpoint} = require('../../../../js/index').server;
const {describe, it, mock, beforeEach, afterEach,} = require('node:test');
const assert = require('node:assert');

const testRoute = {
    method: 'method',
    path: 'path'
};

const diagnosticOrigin = {
    copy() {
    },
    route() {
    },
    handle() {
    }
};

const diagnosticLogger = {
    debug() {
    }
};

const diagnosticRequest = {
    route() {
        return testRoute;
    }
};

function prepareDiagnostic() {
    diagnosticOrigin.options = {};
    diagnosticOrigin.copy = (method, path) => {
        diagnosticOrigin.options.method = method;
        diagnosticOrigin.options.path = path;
        return diagnosticOrigin;
    };
    diagnosticOrigin.route = () => {
        return testRoute;
    };
    diagnosticOrigin.handle = () => {
        return {};
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'route');
    mock.method(diagnosticOrigin, 'handle');

    diagnosticLogger.message = null;
    diagnosticLogger.debug = (message) => {
        diagnosticLogger.message = message;
    };
    mock.method(diagnosticLogger, 'debug');

    mock.method(diagnosticRequest, 'route');
}

function resetDiagnostic() {
    mock.reset();
}

describe('LoggedEndpoint', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new LoggedEndpoint();
                new LoggedEndpoint(diagnosticOrigin, null);
                new LoggedEndpoint(null, diagnosticLogger);
                new LoggedEndpoint(diagnosticOrigin, diagnosticLogger);
            });
        });
    });

    describe('copy', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call origin copy', () => {
            new LoggedEndpoint(diagnosticOrigin, null).copy(testRoute.method, testRoute.path);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.options.method, testRoute.method);
            assert.deepStrictEqual(diagnosticOrigin.options.path, testRoute.path);
        });

        it('should not call origin copy', () => {
            new LoggedEndpoint().copy(null, null, null, diagnosticOrigin);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
            assert.equal(diagnosticOrigin.options.inputStream, null);
            assert.equal(diagnosticOrigin.options.options, null);
        });

        it('should fall when origin copy, cause null', () => {
            assert.throws(() => {
                new LoggedEndpoint().copy();
            }, {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        });

        it('should fall when origin copy, cause error', () => {
            diagnosticOrigin.copy = () => {
                throw new Error('copy error');
            };
            mock.method(diagnosticOrigin, 'copy');

            assert.throws(() => new LoggedEndpoint(diagnosticOrigin).copy(),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);

            assert.doesNotThrow(() => new LoggedEndpoint().copy(null, null, null, diagnosticOrigin),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
        });

        it('should return new LoggedEndpoint instance', () => {
            const loggedEndpoint = new LoggedEndpoint(diagnosticOrigin, diagnosticLogger);
            const copyLoggedEndpoint = loggedEndpoint.copy();

            assert.notEqual(loggedEndpoint, copyLoggedEndpoint);
            assert.strictEqual(typeof loggedEndpoint, typeof copyLoggedEndpoint);
        });
    });

    describe('route', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call route of origin', () => {
            new LoggedEndpoint(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should fall when call route of origin, cause null', () => {
            assert.throws(() => new LoggedEndpoint(null).route(),
                {name: 'TypeError'});
        });

        it('should fall when call route of origin, cause error', () => {
            diagnosticOrigin.route = () => {
                throw new Error('route error');
            };
            mock.method(diagnosticOrigin, 'route');

            assert.throws(() => new LoggedEndpoint(diagnosticOrigin).route(),
                {message: 'route error'});

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should return same route', () => {
            const resultRoute = new LoggedEndpoint(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
            assert.deepStrictEqual(resultRoute, diagnosticOrigin.route());
        });
    });

    describe('handle', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should fall when request is null', async () => {
            await assert.rejects(() => new LoggedEndpoint().handle(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 0);

            await assert.rejects(() => new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 0);
        });

        it('should call debug of logger', async () => {
            await new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest);

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
        });

        it('should call handle of origin', async () => {
            await new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest);

            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 1);
        });

        it('should fall when call debug of logger, cause null', async () => {
            await assert.rejects(() => new LoggedEndpoint(null, null).handle(diagnosticRequest),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 0);
        });

        it('should fall when call debug of logger, cause error', async () => {
            diagnosticLogger.debug = () => {
                throw new Error('debug error');
            };
            mock.method(diagnosticLogger, 'debug');

            await assert.rejects(() => new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest),
                {message: 'debug error'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 0);
        });

        it('should fall when call handle of origin, cause null', async () => {
            await assert.rejects(() => new LoggedEndpoint(null, diagnosticLogger).handle(diagnosticRequest),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 0);
        });

        it('should fall when call handle of origin, cause error', async () => {
            diagnosticOrigin.handle = () => {
                throw new Error('handle error');
            };
            mock.method(diagnosticOrigin, 'handle');

            await assert.rejects(() => new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest),
                {message: 'handle error'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.handle.mock.calls.length, 1);
        });

        it('should log correct message', async () => {
            await new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest);

            assert.strictEqual(diagnosticLogger.message, `HttpEndpoint's handling [${testRoute.method}] ${testRoute.path}`);
        });

        it('should return same response object', async () => {
            const loggedEndpointResult = await new LoggedEndpoint(diagnosticOrigin, diagnosticLogger).handle(diagnosticRequest);

            assert.deepStrictEqual(loggedEndpointResult, diagnosticOrigin.handle());
        });
    });
});