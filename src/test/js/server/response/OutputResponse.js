/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {OutputResponse} = require('../../../../js/index').server;


const testOptions = {
    statusCode: 0,
    body: 'test',
    headers: {header0: 'header0', header1: 'header1'}
};

const diagnosticOutputStream = {
    writeHead() {
    },
    write() {
    },
    end() {
    }
};

function prepareDiagnostic() {
    diagnosticOutputStream.options = {};
    diagnosticOutputStream.writeHead = (statusCode, headers) => {
        diagnosticOutputStream.options.statusCode = statusCode;
        diagnosticOutputStream.options.headers = headers;
    };
    diagnosticOutputStream.write = (body) => {
        diagnosticOutputStream.options.body = body;
    };
    diagnosticOutputStream.end = () => {
        return diagnosticOutputStream.options;
    };

    mock.method(diagnosticOutputStream, 'writeHead');
    mock.method(diagnosticOutputStream, 'write');
    mock.method(diagnosticOutputStream, 'end');
}

function resetDiagnostic() {
    mock.reset();
}

describe('OutputResponse', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputResponse();
                new OutputResponse(undefined, diagnosticOutputStream);
                new OutputResponse(null, diagnosticOutputStream);
                new OutputResponse({}, diagnosticOutputStream);
            });

            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputResponse().copy();
            });

            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
        });

        it('should return new OutputResponse instance', () => {
            const outputResponse = new OutputResponse();
            const copyOutputResponse = outputResponse.copy();

            assert.notEqual(outputResponse, copyOutputResponse);
            assert.strictEqual(typeof outputResponse, typeof copyOutputResponse);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call writeHead, write and end method of outputStream', () => {
            new OutputResponse({body: 'test'}, diagnosticOutputStream)
                .flush();

            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should call only writeHead and end method of outputStream', () => {
            new OutputResponse({body: null}, diagnosticOutputStream)
                .flush();

            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should be equal with input options', () => {
            const resultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .flush();

            assert.deepStrictEqual(resultedOutputStream.options, testOptions);
        });

        it('should be equal with outputStream', () => {
            const resultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .flush();

            assert.equal(resultedOutputStream, diagnosticOutputStream);
        });

        it('should be equal with default options', () => {
            const resultedOutputStream = new OutputResponse(null, diagnosticOutputStream)
                .flush();

            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);

            assert.strictEqual(resultedOutputStream.options.statusCode, 200);
            assert.deepStrictEqual(resultedOutputStream.options.headers, {});
            assert.strictEqual(resultedOutputStream.options.body, undefined);
        });

        it('should fall on writeHead', () => {
            diagnosticOutputStream.writeHead = () => {
                throw new Error('writeHead error');
            };
            mock.method(diagnosticOutputStream, 'writeHead');

            assert.throws(() => new OutputResponse(undefined , diagnosticOutputStream).flush(), {message: 'writeHead error'});
            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should not fall on write', () => {
            diagnosticOutputStream.write = () => {
                throw new Error('write error');
            };
            mock.method(diagnosticOutputStream, 'write');

            assert.doesNotThrow(() => new OutputResponse({body: null}, diagnosticOutputStream).flush());
            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall on write', () => {
            diagnosticOutputStream.write = () => {
                throw new Error('write error');
            };
            mock.method(diagnosticOutputStream, 'write');

            assert.throws(() => new OutputResponse({body: 'now i am falling'}, diagnosticOutputStream).flush(),
                {message: 'write error'});
            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
        });

        it('should fall on end', () => {
            diagnosticOutputStream.end = () => {
                throw new Error('end error');
            };
            mock.method(diagnosticOutputStream, 'end');

            assert.throws(() => new OutputResponse(undefined, diagnosticOutputStream).flush(),
                {message: 'end error'});
            assert.strictEqual(diagnosticOutputStream.writeHead.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });
    });

    describe('update', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should be default', () => {
            const resultedOutputStream = new OutputResponse(undefined, diagnosticOutputStream)
                .update().flush();

            assert.deepStrictEqual(resultedOutputStream.options, {statusCode: 200, headers: {}});
        });

        it('should be updated by statusCode, body and headers', () => {
            const resultedOutputStream = new OutputResponse(undefined, diagnosticOutputStream)
                .update(testOptions).flush();

            assert.deepStrictEqual(resultedOutputStream.options, testOptions);
        });

        it('should be equal before and after update', () => {
            const beforeUpdateResultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .flush();
            assert.deepStrictEqual(beforeUpdateResultedOutputStream.options, testOptions);

            const afterUpdateResultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .update(testOptions).flush();
            assert.deepStrictEqual(afterUpdateResultedOutputStream.options, testOptions);

            assert.deepStrictEqual(beforeUpdateResultedOutputStream.options, afterUpdateResultedOutputStream.options);
        });

        it('should not be updated by null or undefined option param', () => {
            const beforeUpdateResultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .flush();
            assert.deepStrictEqual(beforeUpdateResultedOutputStream.options, testOptions);

            const afterUpdateResultedOutputStream = new OutputResponse(testOptions, diagnosticOutputStream)
                .update({statusCode: null, headers: undefined}).flush();
            assert.deepStrictEqual(afterUpdateResultedOutputStream.options, testOptions);

            assert.deepStrictEqual(beforeUpdateResultedOutputStream.options, afterUpdateResultedOutputStream.options);
        });
    });
});