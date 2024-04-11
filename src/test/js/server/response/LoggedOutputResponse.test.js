/* node:coverage disable */

const {LoggedOutputResponse} = require('../../../../js/index').server;
const {describe, it, mock, beforeEach, afterEach, before, after} = require('node:test');
const assert = require('node:assert');

const diagnosticOrigin = {
    options: {},
    copy(outputStream, options) {
    },
    update(options) {
    },
    flush() {
    }
};

const diagnosticLogger = {
    message: {},
    debug(message) {
    }
};

function prepareDiagnostic() {
    diagnosticOrigin.options = {};
    diagnosticOrigin.copy = (outputStream, options) => {
        diagnosticOrigin.options.outputStream = outputStream;
        diagnosticOrigin.options.options = options;
        return diagnosticOrigin;
    };
    diagnosticOrigin.update = (options) => {
        diagnosticOrigin.options.options = options;
        return diagnosticOrigin;
    };
    diagnosticOrigin.flush = () => {
        return {req: {method: 'method', url: 'url'}, statusCode: 'statusCode'};
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'update');
    mock.method(diagnosticOrigin, 'flush');

    diagnosticLogger.message = null;
    diagnosticLogger.debug = (message) => {
        diagnosticLogger.message = message;
    };
    mock.method(diagnosticLogger, 'debug');
}

function resetDiagnostic() {
    mock.reset();
}

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
        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 0);
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

    it('should fall when call flush of origin, cause null', () => {
        assert.throws(() => new LoggedOutputResponse(null, diagnosticLogger).flush(), {name: 'TypeError'});

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
    });

    it('should fall when call flush of origin, cause error', () => {
        diagnosticOrigin.flush = () => {
            throw new Error('flush error');
        };
        mock.method(diagnosticOrigin, 'flush');

        assert.throws(() => new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush(), {message: 'flush error'});

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        assert.strictEqual(diagnosticLogger.debug.mock.calls.length, 0);
    });

    it('should log correct message', () => {
        new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).flush();

        assert.strictEqual(diagnosticLogger.message, 'HttpResponse: [method] url - statusCode');
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

describe('update', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    it('should call update of origin', () => {
        new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).update();

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should fall when call update of origin, cause null', () => {
        assert.throws(() => new LoggedOutputResponse(null, diagnosticLogger).update(),
            {name: 'TypeError'});
    });

    it('should fall when call update of origin, cause error', () => {
        diagnosticOrigin.update = () => {
            throw new Error('update error');
        };
        mock.method(diagnosticOrigin, 'update');

        assert.throws(() => new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger).update(),
            {message: 'update error'});

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should return new LoggedOutputResponse instance', () => {
        const loggedOutputResponse = new LoggedOutputResponse(diagnosticOrigin, diagnosticLogger);
        const updatedLoggedOutputResponse = loggedOutputResponse.update();

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
        assert.notEqual(loggedOutputResponse, updatedLoggedOutputResponse);
    });
});
