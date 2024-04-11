/* node:coverage disable */

const {JsonOutputResponse} = require('../../../../js/index').server;
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
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'update');
    mock.method(diagnosticOrigin, 'flush');
}

function resetDiagnostic() {
    mock.reset();
}

beforeEach(prepareDiagnostic);
afterEach(resetDiagnostic);

describe('constructor', () => {
    it('should not call anything', () => {
        assert.doesNotThrow(() => {
            new JsonOutputResponse();
            new JsonOutputResponse(null);
            new JsonOutputResponse(diagnosticOrigin);
        });

        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 0);
        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
    });
});

describe('copy', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    it('should call origin copy', () => {
        const testOutputStream = {content: 'test'};
        const testOptions = {content: 'test'};

        new JsonOutputResponse(diagnosticOrigin).copy(testOutputStream, testOptions);

        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
        assert.deepStrictEqual(diagnosticOrigin.options.outputStream, testOutputStream);
        assert.deepStrictEqual(diagnosticOrigin.options.options, testOptions);
    });

    it('should not call origin copy', () => {
        new JsonOutputResponse().copy(null, null, diagnosticOrigin);

        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        assert.equal(diagnosticOrigin.options.outputStream, null);
        assert.equal(diagnosticOrigin.options.options, null);
    });

    it('should fall when origin copy, cause null', () => {
        assert.throws(() => {
            new JsonOutputResponse().copy();
        }, {name: 'TypeError'});

        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
    });

    it('should fall when origin copy, cause error', () => {
        diagnosticOrigin.copy = () => {
            throw new Error('copy error');
        };
        mock.method(diagnosticOrigin, 'copy');

        assert.throws(() => new JsonOutputResponse(diagnosticOrigin).copy(),
            {message: 'copy error'});
        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);

        assert.doesNotThrow(() => new JsonOutputResponse().copy(null, null, diagnosticOrigin),
            {message: 'copy error'});
        assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
    });

    it('should return new JsonOutputResponse instance', () => {
        const jsonOutputResponse = new JsonOutputResponse(diagnosticOrigin);
        const copyJsonOutputResponse = jsonOutputResponse.copy();

        assert.notEqual(jsonOutputResponse, copyJsonOutputResponse);
        assert.strictEqual(typeof jsonOutputResponse, typeof copyJsonOutputResponse);
    });
});

describe('flush', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    it('should call flush of origin', () => {
        new JsonOutputResponse(diagnosticOrigin).flush();

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
    });

    it('should call update of origin', () => {
        new JsonOutputResponse(diagnosticOrigin).flush();

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should fall when call origin, cause null', () => {
        assert.throws(() => new JsonOutputResponse().flush(), {name: 'TypeError'});

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 0);
    });

    it('should fall when call update of origin, cause error', () => {
        diagnosticOrigin.update = () => {
            throw new Error('update error');
        };
        mock.method(diagnosticOrigin, 'update');

        assert.throws(() => new JsonOutputResponse(diagnosticOrigin).flush(), {message: 'update error'});

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should fall when call flush of origin, cause error', () => {
        diagnosticOrigin.flush = () => {
            throw new Error('flush error');
        };
        mock.method(diagnosticOrigin, 'flush');

        assert.throws(() => new JsonOutputResponse(diagnosticOrigin).flush(), {message: 'flush error'});

        assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should return same outputStream', () => {
        const testOutputStream = {content: 'test'};
        diagnosticOrigin.flush = () => {
            return testOutputStream;
        };
        mock.method(diagnosticOrigin, 'flush');

        const resultOutputStream = new JsonOutputResponse(diagnosticOrigin).flush();

        assert.equal(resultOutputStream, testOutputStream);
        assert.deepStrictEqual(resultOutputStream, testOutputStream);
    });

    it('should update headers by content-type', () => {
        new JsonOutputResponse(diagnosticOrigin).flush();

        assert.deepStrictEqual(diagnosticOrigin.options.options.headers, {'Content-Type': 'application/json; charset=utf-8'});
    });
});

describe('update', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    it('should call update of origin', () => {
        new JsonOutputResponse(diagnosticOrigin).update();

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should fall when call update of origin, cause null', () => {
        assert.throws(() => new JsonOutputResponse().update(), {name: 'TypeError'});
    });

    it('should fall when call update of origin, cause error', () => {
        diagnosticOrigin.update = () => {
            throw new Error('update error');
        };
        mock.method(diagnosticOrigin, 'update');

        assert.throws(() => new JsonOutputResponse(diagnosticOrigin).update(),
            {message: 'update error'});

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
    });

    it('should return new JsonOutputResponse instance', () => {
        const jsonOutputResponse = new JsonOutputResponse(diagnosticOrigin);
        const updatedJsonOutputResponse = jsonOutputResponse.update();

        assert.strictEqual(diagnosticOrigin.update.mock.calls.length, 1);
        assert.notEqual(jsonOutputResponse, updatedJsonOutputResponse);
    });
});
