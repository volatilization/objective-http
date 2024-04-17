/* node:coverage disable */

const {InputRequest} = require('../../../../js/index').server;
const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const testOptions = {
    method: 'GET',
    path: '/test',
    query: 'queryParam=queryParam0',
    url: '/test?queryParam=queryParam0',
    headers: {header: 'header'},
    body: 'test body'
};

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
        return testOptions.method;
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
            await assert.rejects(() => new InputRequest().flush(), {name: 'TypeError'});

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
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 0);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new InputRequest(diagnosticInputStream).flush());

            assert.strictEqual(diagnosticInputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 0);
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

        it('should return InputRequest with body', async () => {
            diagnosticInputStream.diagnosticMethod = () => 'POST';
            mock.method(diagnosticInputStream, 'diagnosticMethod');

            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticUrl.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.strictEqual(resultInputRequest.route().method, 'POST');
            assert.strictEqual(resultInputRequest.route().path, testOptions.path);
            assert.strictEqual(resultInputRequest.query().get('queryParam'), 'queryParam0');
            assert.deepStrictEqual(resultInputRequest.headers(), testOptions.headers);
            assert.strictEqual(resultInputRequest.body().toString(), testOptions.body);
        });

        it('should return InputRequest without body', async () => {
            const resultInputRequest = await new InputRequest(diagnosticInputStream).flush();

            assert.strictEqual(diagnosticInputStream.on.mock.calls.length, 0);
            assert.strictEqual(diagnosticInputStream.diagnosticMethod.mock.calls.length, 3);
            assert.strictEqual(diagnosticInputStream.diagnosticUrl.mock.calls.length, 2);
            assert.strictEqual(diagnosticInputStream.diagnosticHeaders.mock.calls.length, 1);

            assert.strictEqual(resultInputRequest.route().method, testOptions.method);
            assert.strictEqual(resultInputRequest.route().path, testOptions.path);
            assert.strictEqual(resultInputRequest.query().get('queryParam'), 'queryParam0');
            assert.deepStrictEqual(resultInputRequest.headers(), testOptions.headers);
            assert.equal(resultInputRequest.body(), null);
        });
    });

    describe('route', () => {
        it('should fall on options, cause of null', () => {
            assert.throws(() => new InputRequest().route(),
                {name: 'TypeError'});
        });

        it('should fall on options.method, cause of null', () => {
            assert.throws(() => new InputRequest(null, {method: null}).route(),
                {name: 'TypeError'});
        });

        it('should fall on options.path, cause of null', () => {
            assert.throws(() => new InputRequest(null, {method: 'notNull', path: null}).route(),
                {name: 'TypeError'});
        });

        it('should return method and path', () => {
            const resultRoure = new InputRequest(null, testOptions).route();

            assert.strictEqual(resultRoure.method, testOptions.method);
            assert.strictEqual(resultRoure.path, testOptions.path);
        });

        it('should return method and path in right case', () => {
            const resultRoure = new InputRequest(null, {method: 'lower', path: 'UPPER'}).route();

            assert.strictEqual(resultRoure.method, 'LOWER');
            assert.strictEqual(resultRoure.path, 'upper');
        });
    });

    describe('query', () => {
        it('should fall on options, cause of null', () => {
            assert.throws(() => new InputRequest().query(),
                {name: 'TypeError'});
        });

        it('should return query', () => {
            const resultQuery = new InputRequest(null, testOptions).query();

            assert.equal(resultQuery, testOptions.query);
            assert.strictEqual(resultQuery, testOptions.query);
        });
    });

    describe('body', () => {
        it('should fall on options, cause of null', () => {
            assert.throws(() => new InputRequest().body(),
                {name: 'TypeError'});
        });

        it('should return body', () => {
            const resultBody = new InputRequest(null, testOptions).body();

            assert.equal(resultBody, testOptions.body);
            assert.strictEqual(resultBody, testOptions.body);
        });
    });

    describe('headers', () => {
        it('should fall on options, cause of null', () => {
            assert.throws(() => new InputRequest().headers(),
                {name: 'TypeError'});
        });

        it('should return headers', () => {
            const resultHeaders = new InputRequest(null, testOptions).headers();

            assert.equal(resultHeaders, testOptions.headers);
            assert.deepStrictEqual(resultHeaders, testOptions.headers);
        });
    });
});