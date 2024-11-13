/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {LoggedOutputResponse} = require('../../../../js/index').server.response;


const diagnosticOrigin = {
    copy() {
    },
    flush() {
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
    diagnosticOrigin.copy = (outputStream, options) => {
        diagnosticOrigin.options.outputStream = outputStream;
        diagnosticOrigin.options.options = options;
        return diagnosticOrigin;
    };
    diagnosticOrigin.flush = () => {
        return {req: {method: 'method', url: 'url'}, statusCode: 'statusCode'};
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'flush');

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

describe('LoggedOutputResponse', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new LoggedOutputResponse();
                new LoggedOutputResponse(null, null);
                new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger);
                new LoggedOutputResponse(null, diagnosticLogger);
                new LoggedOutputResponse(diagnosticOrigin, null);
            });

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call origin copy', () => {
            const testOutputStream = {content: 'test'};
            const testOptions = {content: 'test'};

            new LoggedOutputResponse(diagnosticOrigin, null).copy(testOutputStream, testOptions);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.options.outputStream, testOutputStream);
            assert.deepStrictEqual(diagnosticOrigin.options.options, testOptions);
        });

        it('should not call origin copy', () => {
            new LoggedOutputResponse().copy(null, null, null, diagnosticOrigin);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
            assert.equal(diagnosticOrigin.options.outputStream, null);
            assert.equal(diagnosticOrigin.options.options, null);
        });

        it('should fall when origin copy, cause null', () => {
            assert.throws(() => {
                new LoggedOutputResponse().copy();
            }, {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        });

        it('should fall when origin copy, cause error', () => {
            diagnosticOrigin.copy = () => {
                throw new Error('copy error');
            };
            mock.method(diagnosticOrigin, 'copy');

            assert.throws(() => new LoggedOutputResponse(diagnosticOrigin).copy(),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);

            assert.doesNotThrow(() => new LoggedOutputResponse().copy(null, null, null, diagnosticOrigin),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
        });

        it('should return new LoggedOutputResponse instance', () => {
            const loggedOutputResponse = new LoggedOutputResponse(diagnosticOrigin);
            const copyLoggedOutputResponse = loggedOutputResponse.copy();

            assert.notEqual(loggedOutputResponse, copyLoggedOutputResponse);
            assert.strictEqual(typeof loggedOutputResponse, typeof copyLoggedOutputResponse);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call flush of origin', () => {
            new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        });

        it('should call debug of logger', () => {
            new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 1);
        });

        it('should call error of logger', () => {
            diagnosticOrigin.flush = () => {throw new Error('flush error')};
            mock.method(diagnosticOrigin, 'flush');

            assert.throws(() => new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush());

            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
        });

        it('should not call error of logger', async () => {
            await new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 0);
        });

        it('should fall when call flush of origin, cause null', () => {
            assert.throws(() => new LoggedOutputResponse(null, diagnosticLogger).flush(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.options.error.includes(`HttpResponse error:`), true);
        });

        it('should fall when call flush of origin, cause error', () => {
            diagnosticOrigin.flush = () => {
                throw new Error('flush error');
            };
            mock.method(diagnosticOrigin, 'flush');

            assert.throws(() => new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush(),
                {message: 'flush error'});

            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
            assert.strictEqual(diagnosticLogger.error.mock.calls.length, 1);
            assert.strictEqual(diagnosticLogger.options.error.includes(`HttpResponse error: flush error`), true);
        });

        it('should log correct message', () => {
            new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

            assert.strictEqual(diagnosticLogger.options.message, 'HttpResponse: [method] url - statusCode');
        });

        it('should return same outputStream', () => {
            const testOutputStream = {content: 'test', req: {}};
            diagnosticOrigin.flush = () => {
                return testOutputStream;
            };
            mock.method(diagnosticOrigin, 'flush');

            const resultOutputStream = new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

            assert.equal(resultOutputStream, testOutputStream);
            assert.deepStrictEqual(resultOutputStream, testOutputStream);
        });
    });
});