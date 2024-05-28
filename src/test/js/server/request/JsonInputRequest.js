/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {JsonInputRequest} = require('../../../../js/index').server.request;


const testOptions = {
    method: 'GET',
    path: '/test',
    query: 'queryParam=queryParam0',
    url: '/test?queryParam=queryParam0',
    headers: {header: 'header'},
    body: '{"test":"test"}'
};

const diagnosticOrigin = {
    copy() {
    },
    flush() {
    },
    route() {
    },
    query() {
    },
    body() {
    },
    headers() {
    }
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
    diagnosticMethod() {
    },
    diagnosticUrl() {
    },
    diagnosticHeaders() {
    },
};

function prepareDiagnostic() {
    diagnosticOrigin.options = {};
    diagnosticOrigin.copy = (inputStream, options) => {
        diagnosticOrigin.options.inputStream = inputStream;
        diagnosticOrigin.options.options = options;
        return diagnosticOrigin;
    };
    diagnosticOrigin.flush = () => {
        return diagnosticOrigin;
    };
    diagnosticOrigin.route = () => {
        return {method: testOptions.method, path: testOptions.path};
    };
    diagnosticOrigin.query = () => {
        return testOptions.query;
    };
    diagnosticOrigin.body = () => {
        return testOptions.body;
    };
    diagnosticOrigin.headers = () => {
        return testOptions.headers;
    };
    diagnosticInputStream.diagnosticMethod = () => {
        return testOptions.method;
    };
    diagnosticInputStream.diagnosticUrl = () => {
        return testOptions.url;
    };
    diagnosticInputStream.diagnosticHeaders = () => {
        return testOptions.headers;
    };

    mock.method(diagnosticOrigin, 'copy');
    mock.method(diagnosticOrigin, 'flush');
    mock.method(diagnosticOrigin, 'route');
    mock.method(diagnosticOrigin, 'query');
    mock.method(diagnosticOrigin, 'body');
    mock.method(diagnosticOrigin, 'headers');
    mock.method(diagnosticInputStream, 'diagnosticMethod');
    mock.method(diagnosticInputStream, 'diagnosticUrl');
    mock.method(diagnosticInputStream, 'diagnosticHeaders');
}

function resetDiagnostic() {
    mock.reset();
}

describe('JsonInputRequest', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new JsonInputRequest();
                new JsonInputRequest(null, null);
                new JsonInputRequest(diagnosticOrigin, diagnosticInputStream);
                new JsonInputRequest(null, diagnosticInputStream);
                new JsonInputRequest(diagnosticOrigin, null);
            });

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call origin copy', () => {
            const testInputStream = {content: 'test'};
            const testOptions = {content: 'test'};

            new JsonInputRequest(diagnosticOrigin).copy(testInputStream, testOptions);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.options.inputStream, testInputStream);
            assert.deepStrictEqual(diagnosticOrigin.options.options, testOptions);
        });

        it('should not call origin copy', () => {
            new JsonInputRequest().copy(null, null, diagnosticOrigin);

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
            assert.equal(diagnosticOrigin.options.inputStream, null);
            assert.equal(diagnosticOrigin.options.options, null);
        });

        it('should fall when origin copy, cause null', () => {
            assert.throws(() => {
                new JsonInputRequest().copy();
            }, {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 0);
        });

        it('should fall when origin copy, cause error', () => {
            diagnosticOrigin.copy = () => {
                throw new Error('copy error');
            };
            mock.method(diagnosticOrigin, 'copy');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).copy(),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);

            assert.doesNotThrow(() => new JsonInputRequest().copy(null, null, diagnosticOrigin),
                {message: 'copy error'});
            assert.strictEqual(diagnosticOrigin.copy.mock.calls.length, 1);
        });

        it('should return new JsonInputRequest instance', () => {
            const jsonInputRequest = new JsonInputRequest(diagnosticOrigin, diagnosticInputStream);
            const copyJsonInputRequest = jsonInputRequest.copy();

            assert.notEqual(jsonInputRequest, copyJsonInputRequest);
            assert.strictEqual(typeof jsonInputRequest, typeof copyJsonInputRequest);
        });
    });

    describe('flush', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call flush of origin', async () => {
            await new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush();

            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        });

        it('should fall when validate inputStream, cause null', async () => {
            await assert.rejects(() => new JsonInputRequest().flush(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 0);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 0);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when validate inputStream, cause method error', async () => {
            diagnosticInputStream.diagnosticMethod = () => {
                throw new Error('method error');
            };
            mock.method(diagnosticInputStream, 'diagnosticMethod');

            await assert.rejects(() => new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush(),
                {message: 'method error'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when validate inputStream, cause headers error', async () => {
            diagnosticInputStream.diagnosticMethod = () => {
                return 'POST';
            };
            diagnosticInputStream.diagnosticHeaders = () => {
                throw new Error('headers error');
            };
            mock.method(diagnosticInputStream, 'diagnosticMethod');
            mock.method(diagnosticInputStream, 'diagnosticHeaders');

            await assert.rejects(() => new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush(),
                {message: 'headers error'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when validate inputStream, cause invalid headers', async () => {
            diagnosticInputStream.diagnosticMethod = () => {
                return 'POST';
            };
            mock.method(diagnosticInputStream, 'diagnosticMethod');

            await assert.rejects(() => new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush(),
                {message: 'Wrong content-type. Only application/json accepted.', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when call flush of origin, cause null', async () => {
            await assert.rejects(() => new JsonInputRequest(null, diagnosticInputStream).flush(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 0);
        });

        it('should fall when call flush of origin, cause error', async () => {
            diagnosticOrigin.flush = () => {
                throw new Error('flush error');
            };
            mock.method(diagnosticOrigin, 'flush');

            await assert.rejects(() => new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush(),
                {message: 'flush error'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);
        });

        it('should pass application/json headers', async () => {
            diagnosticInputStream.diagnosticMethod = () => {
                return 'POST';
            };
            diagnosticInputStream.diagnosticHeaders = () => {
                return {'content-type': 'application/json'};
            };
            mock.method(diagnosticInputStream, 'diagnosticMethod');
            mock.method(diagnosticInputStream, 'diagnosticHeaders');

            await assert.doesNotReject(new JsonInputRequest(diagnosticOrigin, diagnosticInputStream).flush(),
                {message: 'Wrong content-type. Only application/json accepted.', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);
            assert.strictEqual(diagnosticOrigin.flush.mock.calls.length, 1);

        });

        it('should return another JsonInputRequest', async () => {
            const loggedInputRequest = new JsonInputRequest(diagnosticOrigin, diagnosticInputStream);
            const flushLoggedInputRequest = loggedInputRequest.flush();

            assert.notEqual(loggedInputRequest, flushLoggedInputRequest);
        });
    });

    describe('route', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call route of origin', () => {
            new JsonInputRequest(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should fall when call route of origin, cause null', () => {
            assert.throws(() => new JsonInputRequest(null).route(),
                {name: 'TypeError'});
        });

        it('should fall when call route of origin, cause error', () => {
            diagnosticOrigin.route = () => {
                throw new Error('route error');
            };
            mock.method(diagnosticOrigin, 'route');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).route(),
                {message: 'route error'});

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
        });

        it('should return same route', () => {
            const resultRoute = new JsonInputRequest(diagnosticOrigin).route();

            assert.strictEqual(diagnosticOrigin.route.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.route(), resultRoute);
        });
    });

    describe('query', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call query of origin', () => {
            new JsonInputRequest(diagnosticOrigin).query();

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
        });

        it('should fall when call query of origin, cause null', () => {
            assert.throws(() => new JsonInputRequest(null).query(),
                {name: 'TypeError'});
        });

        it('should fall when call query of origin, cause error', () => {
            diagnosticOrigin.query = () => {
                throw new Error('query error');
            };
            mock.method(diagnosticOrigin, 'query');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).query(),
                {message: 'query error'});

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
        });

        it('should return same query', () => {
            const resultQuery = new JsonInputRequest(diagnosticOrigin).query();

            assert.strictEqual(diagnosticOrigin.query.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.query(), resultQuery);
        });
    });

    describe('body', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call body of origin', () => {
            new JsonInputRequest(diagnosticOrigin).body();

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
        });

        it('should fall when call body of origin, cause null', () => {
            assert.throws(() => new JsonInputRequest(null).body(),
                {message: 'Wrong body format. Only JSON accepted.', cause: 'INVALID_REQUEST'});
        });

        it('should fall when call body of origin, cause error', () => {
            diagnosticOrigin.body = () => {
                throw new Error('body error');
            };
            mock.method(diagnosticOrigin, 'body');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).body(),
                {message: 'Wrong body format. Only JSON accepted.', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
        });

        it('should return parsed body', () => {
            const resultBody = new JsonInputRequest(diagnosticOrigin).body();

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
            assert.deepStrictEqual(resultBody, JSON.parse(diagnosticOrigin.body()));
        });

        it('should fall when body is not a JSON format', () => {
            diagnosticOrigin.body = () => {
                return 'not_a_JSON';
            };
            mock.method(diagnosticOrigin, 'body');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).body(),
                {message: 'Wrong body format. Only JSON accepted.', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticOrigin.body.mock.calls.length, 1);
        });
    });

    describe('headers', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should call headers of origin', () => {
            new JsonInputRequest(diagnosticOrigin).headers();

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
        });

        it('should fall when call headers of origin, cause null', () => {
            assert.throws(() => new JsonInputRequest(null).headers(),
                {name: 'TypeError'});
        });

        it('should fall when call headers of origin, cause error', () => {
            diagnosticOrigin.headers = () => {
                throw new Error('headers error');
            };
            mock.method(diagnosticOrigin, 'headers');

            assert.throws(() => new JsonInputRequest(diagnosticOrigin).headers(),
                {message: 'headers error'});

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
        });

        it('should return same headers', () => {
            const resultHeaders = new JsonInputRequest(diagnosticOrigin).headers();

            assert.strictEqual(diagnosticOrigin.headers.mock.calls.length, 1);
            assert.deepStrictEqual(diagnosticOrigin.headers(), resultHeaders);
        });
    });
});