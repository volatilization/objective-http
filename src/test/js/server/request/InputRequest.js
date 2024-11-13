/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {InputRequest} = require('../../../../js').server.request;


const testOptions = {
    route: {
        method: 'GET',
        path: '/test'
    },
    query: 'queryParam=queryParam0',
    url: '/test?queryParam=queryParam0',
    headers: {header: 'header'},
    body: 'test body'
};

const diagnosticOptions = {
    get route() {
        return this.diagnosticRoute();
    },
    get query() {
        return this.diagnosticQuery();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    get body() {
        return this.diagnosticBody();
    },
    diagnosticRoute() {
    },
    diagnosticQuery() {
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
    get method() {
        return this.diagnosticMethod();
    },
    get url() {
        return this.diagnosticUrl();
    },
    get headers() {
        return this.diagnosticHeaders();
    },
    diagnosticMethod() {
    },
    diagnosticUrl() {
    },
    diagnosticHeaders() {
    },
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
    diagnosticInputStream.diagnosticMethod = () => {
        return testOptions.route.method;
    };
    diagnosticInputStream.diagnosticUrl = () => {
        return testOptions.url;
    };
    diagnosticInputStream.diagnosticHeaders = () => {
        return testOptions.headers;
    };

    mock.method(diagnosticInputStream, 'once');
    mock.method(diagnosticInputStream, 'on');
    mock.method(diagnosticInputStream, 'diagnosticMethod');
    mock.method(diagnosticInputStream, 'diagnosticUrl');
    mock.method(diagnosticInputStream, 'diagnosticHeaders');

    diagnosticOptions.diagnosticRoute = () => {
        return testOptions.route;
    };
    diagnosticOptions.diagnosticQuery = () => {
        return new URLSearchParams(testOptions.query);
    };
    diagnosticOptions.diagnosticHeaders = () => {
        return new Headers(testOptions.headers);
    };
    diagnosticOptions.diagnosticBody = () => {
        return testOptions.body;
    };

    mock.method(diagnosticOptions, 'diagnosticRoute');
    mock.method(diagnosticOptions, 'diagnosticQuery');
    mock.method(diagnosticOptions, 'diagnosticHeaders');
    mock.method(diagnosticOptions, 'diagnosticBody');
}

function resetDiagnostic() {
    mock.reset();
}

describe('InputRequest', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new InputRequest();
                new InputRequest(diagnosticInputStream, null);
                new InputRequest(diagnosticInputStream, {});
            });

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new InputRequest().copy();
            });
        });

        it('should return new InputRequest instance', () => {
            const inputRequest = new InputRequest();
            const copyInputRequest = inputRequest.copy();

            assert.notEqual(inputRequest, copyInputRequest);
            assert.strictEqual(typeof inputRequest, typeof copyInputRequest);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should fall on inputStream, cause null', async () => {
            await assert.rejects(() => new InputRequest().flush(),
                {cause: 'INVALID_REQUEST'});

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

            await assert.rejects(() => new InputRequest(diagnosticInputStream).flush(),
                {message: 'event error', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new InputRequest(diagnosticInputStream).flush());

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
        });

        it('should return another InputRequest with body', async () => {
            diagnosticInputStream.diagnosticMethod = () => 'POST';
            mock.method(diagnosticInputStream, 'diagnosticMethod');

            const inputRequest = new InputRequest(diagnosticInputStream);
            const resultInputRequest = await inputRequest.flush();

            assert.notEqual(inputRequest, resultInputRequest);
        });

        it('should return another InputRequest without body', async () => {
            const inputRequest = new InputRequest(diagnosticInputStream);
            const resultInputRequest = await inputRequest.flush();

            assert.notEqual(inputRequest, resultInputRequest);
        });

        it('should return InputRequest without body', async () => {
            diagnosticInputStream.diagnosticMethod = () => 'POST';
            diagnosticInputStream.on = (event, cb) => {
                if (event === 'data') {}
                if (event === 'end') {
                    cb();
                }
            }
            mock.method(diagnosticInputStream, 'diagnosticMethod');
            mock.method(diagnosticInputStream, 'on');

            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticUrl.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.strictEqual(resultInputRequest.route().method, 'POST');
            assert.strictEqual(resultInputRequest.route().path, testOptions.route.path);
            assert.strictEqual(resultInputRequest.query().get('queryParam'), 'queryParam0');
            assert.deepStrictEqual(resultInputRequest.headers(), new Headers(testOptions.headers));
            assert.deepStrictEqual(resultInputRequest.body(), Buffer.concat([]));
            assert.strictEqual(resultInputRequest.body().length, 0);
        });

        it('should return InputRequest with body', async () => {
            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticUrl.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.deepStrictEqual(resultInputRequest.route(), testOptions.route);
            assert.strictEqual(resultInputRequest.query().get('queryParam'), 'queryParam0');
            assert.deepStrictEqual(resultInputRequest.headers(), new Headers(testOptions.headers));
            assert.equal(resultInputRequest.body().toString(), testOptions.body);
        });
    });

    describe('route', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).route());

            assert.strictEqual(diagnosticOptions.diagnosticRoute.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputRequest().route(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticRoute.mock.calls.length, 0);
        });

        it('should return route', () => {
            const resultRoure = new InputRequest(null, testOptions).route();

            assert.strictEqual(resultRoure, testOptions.route);
        });
    });

    describe('query', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).query());

            assert.strictEqual(diagnosticOptions.diagnosticQuery.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputRequest().query(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticQuery.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticQuery = () => {
                throw new Error('query error');
            };
            mock.method(diagnosticOptions, 'diagnosticQuery');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).query(),
                {message: 'query error'});
            assert.strictEqual(diagnosticOptions.diagnosticQuery.mock.calls.length, 1);
        });

        it('should return test query value', () => {
            const resultQuery = new InputRequest(undefined, diagnosticOptions).query();

            assert.deepStrictEqual(resultQuery, new URLSearchParams(testOptions.query));
        });
    });

    describe('body', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).body());

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputRequest().body(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticBody = () => {
                throw new Error('body error');
            };
            mock.method(diagnosticOptions, 'diagnosticBody');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).body(), {message: 'body error'});
            assert.strictEqual(diagnosticOptions.diagnosticBody.mock.calls.length, 1);
        });

        it('should return test body value', () => {
            const resultBody = new InputRequest(undefined, diagnosticOptions).body();

            assert.strictEqual(resultBody, testOptions.body);
        });
    });

    describe('headers', () => {
        it('should not fall', () => {
            assert.doesNotThrow(() => new InputRequest(undefined, diagnosticOptions).headers());

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should fall, cause null', () => {
            assert.throws(() => new InputRequest().headers(), {name: 'TypeError'});

            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 0);
        });

        it('should fall, cause error', () => {
            diagnosticOptions.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            mock.method(diagnosticOptions, 'diagnosticHeaders');

            assert.throws(() => new InputRequest(undefined, diagnosticOptions).headers(), {message: 'headers error'});
            assert.strictEqual(diagnosticOptions.diagnosticHeaders.mock.calls.length, 1);
        });

        it('should return test headers value', () => {
            const resultHeaders = new InputRequest(undefined, diagnosticOptions).headers();

            assert.deepStrictEqual(resultHeaders, new Headers(testOptions.headers));
        });
    });
});