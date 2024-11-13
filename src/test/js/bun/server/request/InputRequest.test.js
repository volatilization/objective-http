/* node:coverage disable */

const {describe, test, spyOn, expect, beforeEach, afterEach} = require('bun:test');
const assert = require('node:assert');

const {InputRequest} = require('../../../../../js').bun.server.request;

const testInputStream = {
    method: 'GET',
    url: 'http://localhost/test?query=test',
    headers: new Headers({header: 'header'}),
    body: 'test body'
};

const testOptions = {
    route: {
        method: 'GET',
        path: '/test'
    },
    query: 'query=test',
    headers: {header: 'header'},
    body: 'test body',
};

const diagnosticInputStream = {
    get method() {
        return this.diagnosticMethod();
    },
    get url() {
        return this.diagnosticUrl();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    blob() {},
    diagnosticMethod() {
    },
    diagnosticUrl() {
    },
    diagnosticHeaders() {
    }
};

const diagnosticOptions = {
    get route() {
        return this.diagnosticRoute();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    get body() {
        return this.diagnosticBody();
    },
    get query() {
        return this.diagnosticQuery();
    },
    diagnosticRoute() {
    },
    diagnosticHeaders() {
    },
    diagnosticBody() {
    },
    diagnosticQuery() {
    }
};

function prepareDiagnostic() {
    diagnosticInputStream.diagnosticMethod = () => {
        return testInputStream.method;
    };
    diagnosticInputStream.diagnosticUrl = () => {
        return testInputStream.url;
    };
    diagnosticInputStream.diagnosticHeaders = () => {
        return testInputStream.headers;
    };
    diagnosticInputStream.blob = () => {
        return {
            arrayBuffer () {
                return testInputStream.body;
            }
        };
    };
    diagnosticInputStream.spy = {
        diagnosticMethod: spyOn(diagnosticInputStream, 'diagnosticMethod'),
        diagnosticUrl: spyOn(diagnosticInputStream, 'diagnosticUrl'),
        diagnosticHeaders: spyOn(diagnosticInputStream, 'diagnosticHeaders'),
        blob: spyOn(diagnosticInputStream, 'blob'),
    };

    diagnosticOptions.diagnosticRoute = () => {
        return testOptions.route;
    };
    diagnosticOptions.diagnosticHeaders = () => {
        return testOptions.headers;
    };
    diagnosticOptions.diagnosticBody = () => {
        return testOptions.body;
    };
    diagnosticOptions.diagnosticQuery = () => {
        return testOptions.query;
    };
    diagnosticOptions.spy = {
        diagnosticRoute: spyOn(diagnosticOptions, 'diagnosticRoute'),
        diagnosticHeaders: spyOn(diagnosticOptions, 'diagnosticHeaders'),
        diagnosticBody: spyOn(diagnosticOptions, 'diagnosticBody'),
        diagnosticQuery: spyOn(diagnosticOptions, 'diagnosticQuery'),
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
                new InputRequest();
                new InputRequest(diagnosticInputStream, testOptions);
                new InputRequest(undefined, testOptions);
                new InputRequest(diagnosticInputStream);
            });
        });
    });

    describe('copy', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => new InputRequest().copy());
        });

        test('should return new InputResponse instance', () => {
            const inputRequest = new InputRequest();
            const copyInputRequest = inputRequest.copy();

            assert.notEqual(inputRequest, copyInputRequest);
            assert.strictEqual(typeof inputRequest, typeof copyInputRequest);
        });
    });

    describe('flush', () => {
        test('should fall on inputStream, cause null', async () => {
            await assert.rejects(() => new InputRequest().flush(),
                {cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause method throws error', async () => {
            diagnosticInputStream.diagnosticMethod = () => {throw new Error('method error')};
            diagnosticInputStream.spy.diagnosticMethod = spyOn(diagnosticInputStream, 'diagnosticMethod');

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'method error', cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause url throws error', async () => {
            diagnosticInputStream.diagnosticUrl = () => {throw new Error('url error')};
            diagnosticInputStream.spy.diagnosticUrl = spyOn(diagnosticInputStream, 'diagnosticUrl');

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'url error', cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause headers throws error', async () => {
            diagnosticInputStream.diagnosticHeaders = () => {throw new Error('headers error')};
            diagnosticInputStream.spy.diagnosticHeaders = spyOn(diagnosticInputStream, 'diagnosticHeaders');

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'headers error', cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(0);
        });

        test('should fall on inputStream, cause blob throws error', async () => {
            diagnosticInputStream.blob = () => {throw new Error('blob error')};
            diagnosticInputStream.spy.blob = spyOn(diagnosticInputStream, 'blob');

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'blob error', cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
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

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'arrayBuffer error', cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
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

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {cause: 'INVALID_REQUEST'});

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should not fall', async () => {
            await assert.doesNotReject(() => new InputRequest(diagnosticInputStream).flush());

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);
        });

        test('should return another InputResponse', async () => {
            const inputRequest = new InputRequest(diagnosticInputStream);
            const resultInputRequest = await inputRequest.flush();

            assert.notEqual(inputRequest, resultInputRequest);
        });

        test('should return InputResponse with body', async () => {
            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);

            assert.deepStrictEqual(resultInputRequest.route(), {method: testInputStream.method, path: new URL(testInputStream.url).pathname});
            assert.deepStrictEqual(resultInputRequest.query(), new URLSearchParams(testInputStream.url));
            assert.deepStrictEqual(resultInputRequest.headers(), testInputStream.headers);
            assert.deepStrictEqual(resultInputRequest.body(), Buffer.from(testInputStream.body));
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

            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            expect(diagnosticInputStream.spy.diagnosticMethod).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.diagnosticUrl).toHaveBeenCalledTimes(2);
            expect(diagnosticInputStream.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
            expect(diagnosticInputStream.spy.blob).toHaveBeenCalledTimes(1);

            assert.deepStrictEqual(resultInputRequest.route(), {method: testInputStream.method, path: new URL(testInputStream.url).pathname});
            assert.deepStrictEqual(resultInputRequest.query(), new URLSearchParams(testInputStream.url));
            assert.deepStrictEqual(resultInputRequest.headers(), testInputStream.headers);
            assert.deepStrictEqual(resultInputRequest.body(), Buffer.from([]));
            assert.deepStrictEqual(resultInputRequest.body().length, 0);
        });
    });

    describe('route', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).route());

            expect(diagnosticOptions.spy.diagnosticRoute).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputRequest().route(),
                {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticRoute).toHaveBeenCalledTimes(0);
        });

        test('should return route value in right cases', () => {
            const resultRoute = new InputRequest(undefined, diagnosticOptions).route();

            assert.deepStrictEqual(resultRoute, testOptions.route);
        });
    });

    describe('query', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).query());

            expect(diagnosticOptions.spy.diagnosticQuery).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputRequest().query(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticQuery).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticQuery = () => {
                throw new Error('query error');
            };
            diagnosticOptions.spy.diagnosticQuery = spyOn(diagnosticOptions, 'diagnosticQuery');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).query(),
                {message: 'query error'});

            expect(diagnosticOptions.spy.diagnosticQuery).toHaveBeenCalledTimes(1);
        });

        test('should return test query value', () => {
            const resultQuery = new InputRequest(undefined, diagnosticOptions).query();

            assert.strictEqual(resultQuery, testOptions.query);
        });
    });

    describe('headers', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).headers());

            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputRequest().headers(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            diagnosticOptions.spy.diagnosticHeaders = spyOn(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).headers(),
                {message: 'headers error'});
            expect(diagnosticOptions.spy.diagnosticHeaders).toHaveBeenCalledTimes(1);
        });

        test('should return test headers value', () => {
            const resultHeaders = new InputRequest(undefined, diagnosticOptions).headers();

            assert.strictEqual(resultHeaders, testOptions.headers);
        });
    });

    describe('body', () => {
        test('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).body());

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(1);
        });

        test('should fall, cause null', () => {
            assert.throws(() => new InputRequest().body(), {name: 'TypeError'});

            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause error', () => {
            diagnosticOptions.diagnosticBody = () => {
                throw new Error('body error');
            };
            diagnosticOptions.spy.diagnosticBody = spyOn(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).body(),
                {message: 'body error'});
            expect(diagnosticOptions.spy.diagnosticBody).toHaveBeenCalledTimes(1);
        });

        test('should return test body value', () => {
            const resultBody = new InputRequest(undefined, diagnosticOptions).body();

            assert.strictEqual(resultBody, testOptions.body);
        });
    });
});