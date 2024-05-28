/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {LoggedInputRequest} = require('../../../../js/index').server.request;


const diagnosticOrigin = {
    copy() {
    },
    flush() {
    },
    route() {
    },
    query() {
    },
    body() {
    },
    headers() {
    }
};

const diagnosticLogger = {
    debug() {
    },
    error() {
    }
};

function prepareDiagnostic() {
    diagnosticOrigin.options = {};
    diagnosticOrigin.copy = (inputStream, options) => {
        diagnosticOrigin.options.inputStream = inputStream;
        diagnosticOrigin.options.options = options;
        return diagnosticOrigin;
    };
    diagnosticOrigin.flush = () => {
        return diagnosticOrigin;
    };
    diagnosticOrigin.route = () => {
        return {method: 'method', path: 'path'};
    };
    diagnosticOrigin.query = () => {
        return 'query';
    };
    diagnosticOrigin.body = () => {
        return 'test body';
    };
    diagnosticOrigin.headers = () => {
        return {header: 'header'};
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'flush');
    mock.method(diagnosticOrigin, 'route');
    mock.method(diagnosticOrigin, 'query');
    mock.method(diagnosticOrigin, 'body');
    mock.method(diagnosticOrigin, 'headers');

    diagnosticLogger.options = {};
    diagnosticLogger.debug = (message) => {
        diagnosticLogger.options.message = message;
    };
    diagnosticLogger.error = (message) => {
        diagnosticLogger.options.error = message;
    };
    mock.method(diagnosticLogger, 'debug');
    mock.method(diagnosticLogger, 'error');
}

function resetDiagnostic() {
    mock.reset();
}

describe('LoggedInputRequest', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new LoggedInputRequest();
                new LoggedInputRequest(null, null);
                new LoggedInputRequest(diagnosticOrigin, diagnosticLogger);
                new LoggedInputRequest(null, diagnosticLogger);
                new LoggedInputRequest(diagnosticOrigin, null);
            });

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call origin copy', () => {
            const testInputStream = {content: 'test'};
            const testOptions = {content: 'test'};

            new LoggedInputRequest(diagnosticOrigin, null).copy(testInputStream, testOptions);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.options.inputStream, testInputStream);
            assert.deepStrictEqual(diagnosticOrigin.options.options, testOptions);
        });

        it('should not call origin copy', () => {
            new LoggedInputRequest().copy(null, null, null, diagnosticOrigin);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
            assert.equal(diagnosticOrigin.options.inputStream, null);
            assert.equal(diagnosticOrigin.options.options, null);
        });

        it('should fall when origin copy, cause null', () => {
            assert.throws(() => {
                new LoggedInputRequest().copy();
            }, {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        });

        it('should fall when origin copy, cause error', () => {
            diagnosticOrigin.copy = () => {
                throw new Error('copy error');
            };
            mock.method(diagnosticOrigin, 'copy');

            assert.throws(() => new LoggedInputRequest(diagnosticOrigin).copy(),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);

            assert.doesNotThrow(() => new LoggedInputRequest().copy(null, null, null, diagnosticOrigin),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
        });

        it('should return new LoggedInputRequest instance', () => {
            const loggedInputRequest = new LoggedInputRequest(diagnosticOrigin, diagnosticLogger);
            const copyLoggedInputRequest = loggedInputRequest.copy();

            assert.notEqual(loggedInputRequest, copyLoggedInputRequest);
            assert.strictEqual(typeof loggedInputRequest, typeof copyLoggedInputRequest);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call flush of origin', async () => {
            await new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {}).flush();

            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        });

        it('should call debug of logger', async () => {
            await new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {}).flush();

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
        });

        it('should call error of logger', async () => {
            diagnosticOrigin.flush = () => {throw new Error('flush error')};
            mock.method(diagnosticOrigin, 'flush');

            await assert.rejects(() => new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {}).flush());

            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
        });

        it('should not call error of logger', async () => {
            await new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {}).flush();

            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 0);
        });


        it('should fall when call debug of logger, cause null', async () => {
            await assert.rejects(() => new LoggedInputRequest(null, null, {}).flush(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when call debug of logger, cause error', async () => {
            diagnosticLogger.debug = () => {
                throw new Error('debug error');
            };
            mock.method(diagnosticLogger, 'debug');

            await assert.rejects(() => new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {}).flush(),
                {message: 'debug error'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when call flush of origin, cause null', async () => {
            await assert.rejects(() => new LoggedInputRequest(
                    null, diagnosticLogger, {method: 'method', url: 'url'}
                ).flush(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.options.error.includes('HttpRequest: [method] url error:'), true)
        });

        it('should fall when call flush of origin, cause error', async () => {
            diagnosticOrigin.flush = () => {
                throw new Error('flush error');
            };
            mock.method(diagnosticOrigin, 'flush');

            await assert.rejects(() => new LoggedInputRequest(
                    diagnosticOrigin, diagnosticLogger, {method: 'method', url: 'url'}
                ).flush(),
                {message: 'flush error'});

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.options.error.includes('HttpRequest: [method] url error: flush error'), true)
        });

        it('should log correct message', async () => {
            await new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {
                method: 'method',
                url: 'url',
                headers: {header: 'header'}
            }).flush();

            assert.strictEqual(diagnosticLogger.options.message, 'HttpRequest: [method] url {"header":"header"}');
        });

        it('should return another LoggedInputRequest', async () => {
            const loggedInputRequest = new LoggedInputRequest(diagnosticOrigin, diagnosticLogger, {});
            const flushLoggedInputRequest = loggedInputRequest.flush();

            assert.notEqual(loggedInputRequest, flushLoggedInputRequest);
        });
    });

    describe('route', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call route of origin', () => {
            new LoggedInputRequest(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should fall when call route of origin, cause null', () => {
            assert.throws(() => new LoggedInputRequest(null).route(),
                {name: 'TypeError'});
        });

        it('should fall when call route of origin, cause error', () => {
            diagnosticOrigin.route = () => {
                throw new Error('route error');
            };
            mock.method(diagnosticOrigin, 'route');

            assert.throws(() => new LoggedInputRequest(diagnosticOrigin).route(),
                {message: 'route error'});

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should return same route', () => {
            const resultRoute = new LoggedInputRequest(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.route(), resultRoute);
        });
    });

    describe('query', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call query of origin', () => {
            new LoggedInputRequest(diagnosticOrigin).query();

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
        });

        it('should fall when call query of origin, cause null', () => {
            assert.throws(() => new LoggedInputRequest(null).query(),
                {name: 'TypeError'});
        });

        it('should fall when call query of origin, cause error', () => {
            diagnosticOrigin.query = () => {
                throw new Error('query error');
            };
            mock.method(diagnosticOrigin, 'query');

            assert.throws(() => new LoggedInputRequest(diagnosticOrigin).query(),
                {message: 'query error'});

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
        });

        it('should return same query', () => {
            const resultQuery = new LoggedInputRequest(diagnosticOrigin).query();

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.query(), resultQuery);
        });
    });

    describe('body', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call body of origin', () => {
            new LoggedInputRequest(diagnosticOrigin).body();

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
        });

        it('should fall when call body of origin, cause null', () => {
            assert.throws(() => new LoggedInputRequest(null).body(),
                {name: 'TypeError'});
        });

        it('should fall when call body of origin, cause error', () => {
            diagnosticOrigin.body = () => {
                throw new Error('body error');
            };
            mock.method(diagnosticOrigin, 'body');

            assert.throws(() => new LoggedInputRequest(diagnosticOrigin).body(),
                {message: 'body error'});

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
        });

        it('should return same body', () => {
            const resultBody = new LoggedInputRequest(diagnosticOrigin).body();

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.body(), resultBody);
        });
    });

    describe('headers', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call headers of origin', () => {
            new LoggedInputRequest(diagnosticOrigin).headers();

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
        });

        it('should fall when call headers of origin, cause null', () => {
            assert.throws(() => new LoggedInputRequest(null).headers(),
                {name: 'TypeError'});
        });

        it('should fall when call headers of origin, cause error', () => {
            diagnosticOrigin.headers = () => {
                throw new Error('headers error');
            };
            mock.method(diagnosticOrigin, 'headers');

            assert.throws(() => new LoggedInputRequest(diagnosticOrigin).headers(),
                {message: 'headers error'});

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
        });

        it('should return same headers', () => {
            const resultHeaders = new LoggedInputRequest(diagnosticOrigin).headers();

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.headers(), resultHeaders);
        });
    });
});