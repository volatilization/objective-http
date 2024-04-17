/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {InputResponse} = require('../../../../js').client;

const testOptions = {
    statusCode: 200,
    headers: new Headers({header: 'header'}),
    body: 'test body'
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
}

const diagnosticInputStream = {
    on() {
    },
    once() {
    },
    get statusCode() {
        return this.diagnosticStatusCode();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    diagnosticStatusCode() {
    },
    diagnosticHeaders() {
    }
};

function prepareDiagnostic() {
    diagnosticInputStream.on = (event, cb) => {
        if (event === 'data') {
            cb(Buffer.from(testOptions.body, 'utf8'));
        }
        if (event === 'end') {
            cb();
        }
    };
    diagnosticInputStream.once = () => {
    };
    diagnosticInputStream.diagnosticStatusCode = () => {
        return testOptions.statusCode;
    };
    diagnosticInputStream.diagnosticHeaders = () => {
        return testOptions.headers;
    };
    diagnosticInputStream.diagnosticBody = () => {
        return testOptions.body;
    };

    mock.method(diagnosticInputStream, 'once');
    mock.method(diagnosticInputStream, 'on');
    mock.method(diagnosticInputStream, 'diagnosticStatusCode');
    mock.method(diagnosticInputStream, 'diagnosticHeaders');

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
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new InputResponse();
                new InputResponse(diagnosticInputStream, testOptions);
                new InputResponse(undefined, testOptions);
                new InputResponse(diagnosticInputStream);
            });
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => new InputResponse().copy());
        });

        it('should return new InputResponse instance', () => {
            const inputResponse = new InputResponse();
            const copyInputResponse = inputResponse.copy();

            assert.notEqual(inputResponse, copyInputResponse);
            assert.strictEqual(typeof inputResponse, typeof copyInputResponse);
        });
    });

    describe('flush', () => {

        it('should fall on inputStream, cause null', async () => {
            await assert.rejects(() => new InputResponse().flush(), {name: 'TypeError'});

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 0);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 0);
        });

        it('should fall on inputStream, cause error event', async () => {
            diagnosticInputStream.once = (event, cb) => {
                if (event === 'error') {
                    cb(new Error('event error'));
                }
            };
            mock.method(diagnosticInputStream, 'once');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {message: 'event error', cause: 'INVALID_RESPONSE'});

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new InputResponse(diagnosticInputStream).flush());

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
        });

        it('should return another InputResponse', async () => {
            const inputResponse = new InputResponse(diagnosticInputStream);
            const resultInputResponse = await inputResponse.flush();

            assert.notEqual(inputResponse, resultInputResponse);
        });

        it('should return InputResponse without body', async () => {
            diagnosticInputStream.on = (event, cb) => {
                if (event === 'data') {}
                if (event === 'end') {
                    cb();
                }
            }
            mock.method(diagnosticInputStream, 'on');

            const resultInputResponse = await new InputResponse(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticStatusCode.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.strictEqual(resultInputResponse.statusCode(), testOptions.statusCode);
            assert.deepStrictEqual(resultInputResponse.headers(), new Headers(testOptions.headers));
            assert.deepStrictEqual(resultInputResponse.body(), Buffer.concat([]));
            assert.strictEqual(resultInputResponse.body().length, 0);
        });

        it('should return InputResponse with body', async () => {
            const resultInputResponse = await new InputResponse(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticStatusCode.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.strictEqual(resultInputResponse.statusCode(), testOptions.statusCode);
            assert.deepStrictEqual(resultInputResponse.headers(), new Headers(testOptions.headers));
            assert.equal(resultInputResponse.body().toString(), testOptions.body);
        });
    });

    describe('statusCode', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).statusCode());

            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().statusCode(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticStatusCode = () => {
                throw new Error('statusCode error');
            };
            mock.method(diagnosticOptions, 'diagnosticStatusCode');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).statusCode(), {message: 'statusCode error'});
            assert.strictEqual(diagnosticOptions.diagnosticStatusCode.mock.calls.length, 1);
        });

        it('should return test statusCode value', () => {
            const resultStatusCode = new InputResponse(undefined, diagnosticOptions).statusCode();

            assert.strictEqual(resultStatusCode, testOptions.statusCode);
        });
    });

    describe('headers', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).headers());

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().headers(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            mock.method(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).headers(), {message: 'headers error'});
            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should return test headers value', () => {
            const resultHeaders = new InputResponse(undefined, diagnosticOptions).headers();

            assert.strictEqual(resultHeaders, testOptions.headers);
        });
    });

    describe('body', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).body());

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputResponse().body(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticBody = () => {
                throw new Error('body error');
            };
            mock.method(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).body(), {message: 'body error'});
            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should return test body value', () => {
            const resultBody = new InputResponse(undefined, diagnosticOptions).body();

            assert.strictEqual(resultBody, testOptions.body);
        });
    });
});