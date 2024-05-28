/* node:coverage disable */

const {describe, test, spyOn, expect, beforeEach, afterEach} = require('bun:test');
const assert = require('node:assert');

const {InputResponse} = require('../../../../../js').bun.client.response;

const testResponse = {
    status: 200,
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
    get status() {
        return this.diagnosticStatus();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    blob() {},
    diagnosticStatus() {
    },
    diagnosticHeaders() {
    }
};

function prepareDiagnostic() {
    diagnosticInputStream.diagnosticStatus = () => {
        return testResponse.status;
    };
    diagnosticInputStream.diagnosticHeaders = () => {
        return testResponse.headers;
    };
    diagnosticInputStream.blob = () => {
        return {
            arrayBuffer () {
                return testResponse.body;
            }
        };
    };
    diagnosticInputStream.spy = {
        diagnosticStatus: spyOn(diagnosticInputStream, 'diagnosticStatus'),
        diagnosticHeaders: spyOn(diagnosticInputStream, 'diagnosticHeaders'),
        blob: spyOn(diagnosticInputStream, 'blob'),
    };

    diagnosticOptions.diagnosticStatusCode = () => {
        return testResponse.status;
    };
    diagnosticOptions.diagnosticHeaders = () => {
        return testResponse.headers;
    };
    diagnosticOptions.diagnosticBody = () => {
        return testResponse.body;
    };
    diagnosticOptions.spy = {
        diagnosticStatusCode: spyOn(diagnosticOptions, 'diagnosticStatusCode'),
        diagnosticHeaders: spyOn(diagnosticOptions, 'diagnosticHeaders'),
        diagnosticBody: spyOn(diagnosticOptions, 'diagnosticBody'),
    }
}

function resetDiagnostic() {
    diagnosticInputStream.spy = {};
    diagnosticOptions.spy = {};
}

describe('InputResponse', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => {
                new InputResponse();
                new InputResponse(diagnosticInputStream, testResponse);
                new InputResponse(undefined, testResponse);
                new InputResponse(diagnosticInputStream);
            });
        });
    });

    describe('copy', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => new InputResponse().copy());
        });

        test('should return new InputResponse instance', () => {
            const inputResponse = new InputResponse();
            const copyInputResponse = inputResponse.copy();

            assert.notEqual(inputResponse, copyInputResponse);
            assert.strictEqual(typeof inputResponse, typeof copyInputResponse);
        });
    });

    describe('flush', () => {
        test('should fall on inputStream, cause null', async () => {
            await assert.rejects(() => new InputResponse().flush(),
                {cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause status throws error', async () => {
            diagnosticInputStream.diagnosticStatus = () => {throw new Error('status error')};
            diagnosticInputStream.spy.diagnosticStatus = spyOn(diagnosticInputStream, 'diagnosticStatus');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {message: 'status error', cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause headers throws error', async () => {
            diagnosticInputStream.diagnosticHeaders = () => {throw new Error('headers error')};
            diagnosticInputStream.spy.diagnosticHeaders = spyOn(diagnosticInputStream, 'diagnosticHeaders');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {message: 'headers error', cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause blob throws error', async () => {
            diagnosticInputStream.blob = () => {throw new Error('blob error')};
            diagnosticInputStream.spy.blob = spyOn(diagnosticInputStream, 'blob');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {message: 'blob error', cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should fall on inputStream, cause blob.arrayBuffer throws error', async () => {
            diagnosticInputStream.blob = () => {
                return {
                    arrayBuffer () {
                        throw new Error('arrayBuffer error');
                    }
                };
            };
            diagnosticInputStream.spy.blob = spyOn(diagnosticInputStream, 'blob');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {message: 'arrayBuffer error', cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should fall cause blob.arrayBuffer is empty', async () => {
            diagnosticInputStream.blob = () => {
                return {
                    arrayBuffer () {
                        return null;
                    }
                };
            };
            diagnosticInputStream.spy.blob = spyOn(diagnosticInputStream, 'blob');

            await assert.rejects(() => new InputResponse(diagnosticInputStream).flush(),
                {cause: 'INVALID_RESPONSE'});

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should not fall', async () => {
            await assert.doesNotReject(() => new InputResponse(diagnosticInputStream).flush());

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should return another InputResponse', async () => {
            const inputResponse = new InputResponse(diagnosticInputStream);
            const resultInputResponse = await inputResponse.flush();

            assert.notEqual(inputResponse, resultInputResponse);
        });

        test('should return InputResponse with body', async () => {
            const resultInputResponse = await new InputResponse(diagnosticInputStream).flush();

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);

            assert.strictEqual(resultInputResponse.statusCode(), testResponse.status);
            assert.deepStrictEqual(resultInputResponse.headers(), new Headers(testResponse.headers));
            assert.deepStrictEqual(resultInputResponse.body(), Buffer.from(testResponse.body));
        });

        test('should return InputResponse with empty body', async () => {
            diagnosticInputStream.blob = () => {
                return {
                    arrayBuffer () {
                        return [];
                    }
                };
            };
            diagnosticInputStream.spy.blob = spyOn(diagnosticInputStream, 'blob');

            const resultInputResponse = await new InputResponse(diagnosticInputStream).flush();

            expect(diagnosticInputStream.spy.diagnosticStatus).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);

            assert.strictEqual(resultInputResponse.statusCode(), testResponse.status);
            assert.deepStrictEqual(resultInputResponse.headers(), new Headers(testResponse.headers));
            assert.deepStrictEqual(resultInputResponse.body(), Buffer.from([]));
            assert.deepStrictEqual(resultInputResponse.body().length, 0);
        });
    });

    describe('statusCode', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).statusCode());

            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputResponse().statusCode(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticStatusCode = () => {
                throw new Error('statusCode error');
            };
            diagnosticOptions.spy.diagnosticStatusCode = spyOn(diagnosticOptions, 'diagnosticStatusCode');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).statusCode(), {message: 'statusCode error'});
            expect(diagnosticOptions.spy.diagnosticStatusCode).toHaveBeenCalledTimes(1);
        });

        test('should return test statusCode value', () => {
            const resultStatusCode = new InputResponse(undefined, diagnosticOptions).statusCode();

            assert.strictEqual(resultStatusCode, testResponse.status);
        });
    });

    describe('headers', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).headers());

            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputResponse().headers(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            diagnosticOptions.spy.diagnosticHeaders = spyOn(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).headers(), {message: 'headers error'});
            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });

        test('should return test headers value', () => {
            const resultHeaders = new InputResponse(undefined, diagnosticOptions).headers();

            assert.strictEqual(resultHeaders, testResponse.headers);
        });
    });

    describe('body', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputResponse(undefined, diagnosticOptions).body());

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputResponse().body(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticBody = () => {
                throw new Error('body error');
            };
            diagnosticOptions.spy.diagnosticBody = spyOn(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new InputResponse(undefined, diagnosticOptions).body(), {message: 'body error'});
            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(1);
        });

        test('should return test body value', () => {
            const resultBody = new InputResponse(undefined, diagnosticOptions).body();

            assert.strictEqual(resultBody, testResponse.body);
        });
    });
});