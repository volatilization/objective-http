/* node:coverage disable */

const {describe, test, spyOn, expect, beforeEach, afterEach} = require('bun:test');
const assert = require('node:assert');

const {OutputResponse} = require('../../../../../js').bun.server.response;


const testOptions = {
    statusCode: 200,
    headers: {header: 'header'},
    body: 'test'
};

const diagnosticOptions = {
    get statusCode() {
        return this.diagnosticStatusCode();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    get body() {
        return this.diagnosticBody();
    },
    diagnosticStatusCode() {
    },
    diagnosticHeaders() {
    },
    diagnosticBody() {
    }
};

function prepareDiagnostic() {
    diagnosticOptions.diagnosticStatusCode = () => {
        return testOptions.status;
    };
    diagnosticOptions.diagnosticHeaders = () => {
        return testOptions.headers;
    };
    diagnosticOptions.diagnosticBody = () => {
        return testOptions.body;
    };
    diagnosticOptions.spy = {
        diagnosticStatusCode: spyOn(diagnosticOptions, 'diagnosticStatusCode'),
        diagnosticHeaders: spyOn(diagnosticOptions, 'diagnosticHeaders'),
        diagnosticBody: spyOn(diagnosticOptions, 'diagnosticBody'),
    };
}

function resetDiagnostic() {
    diagnosticOptions.spy = {};
}

describe('OutputResponse', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputResponse();
                new OutputResponse(testOptions);
                new OutputResponse(testOptions, {});
            });
        });
    });

    describe('copy', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputResponse().copy();
            });
        });

        test('should return new OutputResponse instance', () => {
            const outputResponse = new OutputResponse();
            const copyOutputResponse = outputResponse.copy();

            assert.notEqual(outputResponse, copyOutputResponse);
            assert.strictEqual(typeof outputResponse, typeof copyOutputResponse);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        test('should be equal with input options', () => {
            const resultedOutputStream = new OutputResponse(testOptions).flush();

            assert.deepStrictEqual(resultedOutputStream,
                new Response(testOptions.body, {
                    status: testOptions.statusCode,
                    headers: testOptions.headers
                }));
        });

        test('should be equal with default options', () => {
            const resultedOutputStream = new OutputResponse().flush();

            assert.deepStrictEqual(resultedOutputStream,
                new Response(undefined, {
                    status: 200,
                    headers: {}
                }));
        });

        test('should fall, cause statusCode throws error', () => {
            diagnosticOptions.diagnosticStatusCode = () => {
                throw new Error('statusCode error');
            };
            diagnosticOptions.spy.diagnosticStatusCode = spyOn(diagnosticOptions, 'diagnosticStatusCode');

            assert.throws(() => new OutputResponse(diagnosticOptions).flush(),
                {message: 'statusCode error'});

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(0);
            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(1);
            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause headers throws error', () => {
            diagnosticOptions.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            diagnosticOptions.spy.diagnosticHeaders = spyOn(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new OutputResponse(diagnosticOptions).flush(),
                {message: 'headers error'});

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(0);
            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(1);
            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause body throws error', () => {
            diagnosticOptions.diagnosticBody = () => {
                throw new Error('body error');
            };
            diagnosticOptions.spy.diagnosticBody = spyOn(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new OutputResponse(diagnosticOptions).flush(),
                {message: 'body error'});

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(1);
            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(1);
            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });
    });
});