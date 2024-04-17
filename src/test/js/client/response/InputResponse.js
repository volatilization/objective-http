/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {InputResponse} = require('../../../../js').client;

const testOptions = {
    statusCode: 200,
    headers: new Headers({header: 'header'}),
    body: 'test body'
}

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
}

function prepareDiagnostic() {
    diagnosticOptions.diagnosticStatusCode = () => {
        return testOptions.statusCode;
    };
    diagnosticOptions.diagnosticHeaders = () => {
        return testOptions.headers;
    };
    diagnosticOptions.diagnosticBody = () => {
        return testOptions.body;
    };

    mock.method(diagnosticOptions, 'diagnosticStatusCode');
    mock.method(diagnosticOptions, 'diagnosticHeaders');
    mock.method(diagnosticOptions, 'diagnosticBody');
}

function resetDiagnostic() {
    mock.reset();
}

describe('InputResponse', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic)

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new InputResponse();
                new InputResponse(testOptions);
            });

            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 0);
            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 0);
            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => new InputResponse().copy());
        });

        it('should return new InputRequest instance', () => {
            const inputResponse = new InputResponse();
            const copyInputResponse = inputResponse.copy();

            assert.notEqual(inputResponse, copyInputResponse);
            assert.strictEqual(typeof inputResponse, typeof copyInputResponse);
        });
    });

    describe('statusCode', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(diagnosticOptions).statusCode());

            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().statusCode(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticStatusCode = () => {throw new Error('statusCode error')};
            mock.method(diagnosticOptions, 'diagnosticStatusCode');

            assert.throws(() => new InputResponse(diagnosticOptions).statusCode(), {message: 'statusCode error'});
            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 1);
        });

        it('should return test statusCode value', () => {
            const resultStatusCode = new InputResponse(diagnosticOptions).statusCode();

            assert.strictEqual(resultStatusCode, testOptions.statusCode);
        });
    });

    describe('headers', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(diagnosticOptions).headers());

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().headers(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticHeaders = () => {throw new Error('headers error')};
            mock.method(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new InputResponse(diagnosticOptions).headers(), {message: 'headers error'});
            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should return test headers value', () => {
            const resultHeaders = new InputResponse(diagnosticOptions).headers();

            assert.strictEqual(resultHeaders, testOptions.headers);
        });
    });

    describe('body', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(diagnosticOptions).body());

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().body(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticBody = () => {throw new Error('body error')};
            mock.method(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new InputResponse(diagnosticOptions).body(), {message: 'body error'});
            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should return test body value', () => {
            const resultBody = new InputResponse(diagnosticOptions).body();

            assert.strictEqual(resultBody, testOptions.body);
        });
    });
});