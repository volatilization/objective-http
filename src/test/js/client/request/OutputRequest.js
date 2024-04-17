/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {OutputRequest} = require('../../../../js').client;

const testOptions = {
    statusCode: 200,
    method: 'GET',
    body: 'test body',
    headers: {header: 'header'}
};

const diagnosticResponse = {
    copy() {
    }
};

const diagnosticHttp = {
    request() {
    }
};

const diagnosticInputStream = {
    on() {
    },
    once() {
    },
};

const diagnosticOutputStream = {
    write() {
    },
    end() {
    }
};

function prepareDiagnostic() {
    diagnosticInputStream.options = {};
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
    mock.method(diagnosticInputStream, 'on');
    mock.method(diagnosticInputStream, 'once');

    diagnosticOutputStream.options = {};
    diagnosticOutputStream.write = (body) => {
        diagnosticOutputStream.options.body = body;
    };
    diagnosticOutputStream.end = () => {
        return diagnosticOutputStream.options;
    };

    mock.method(diagnosticOutputStream, 'write');
    mock.method(diagnosticOutputStream, 'end');

    diagnosticHttp.options = {};
    diagnosticHttp.request = (options, cb) => {
        diagnosticHttp.options.options = options;
        cb(diagnosticInputStream);
        return diagnosticOutputStream;
    };

    mock.method(diagnosticHttp, 'request');

    diagnosticResponse.options = {};
    diagnosticResponse.copy = (options) => {
        diagnosticResponse.options.options = options;
    };

    mock.method(diagnosticResponse, 'copy');
}

function resetDiagnostic() {
    mock.reset();
}

describe('OutputRequest', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest();
                new OutputRequest(diagnosticHttp, diagnosticResponse, testOptions);
            });

            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 0);
            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest().copy();
                new OutputRequest(diagnosticHttp, diagnosticResponse, testOptions).copy();
                new OutputRequest().copy(testOptions, diagnosticResponse, diagnosticHttp);
                new OutputRequest(diagnosticHttp, diagnosticResponse, testOptions).copy(testOptions, diagnosticResponse, diagnosticHttp);
            });
        });

        it('should return new InputRequest instance', () => {
            const inputResponse = new OutputRequest();
            const copyInputResponse = inputResponse.copy();

            assert.notEqual(inputResponse, copyInputResponse);
            assert.strictEqual(typeof inputResponse, typeof copyInputResponse);
        });
    });

    describe('send', () => {
        it('should fall, cause of null http', async () => {
            await assert.rejects(() => new OutputRequest(undefined).send(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause of error http', async () => {
            diagnosticHttp.request = () => {throw new Error('http error')}
            mock.method(diagnosticHttp, 'request');

            await assert.rejects(() => new OutputRequest(diagnosticHttp).send(),
                {message: 'http error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause of error http', async () => {
            diagnosticHttp.request = () => {throw new Error('http error')}
            mock.method(diagnosticHttp, 'request');

            await assert.rejects(() => new OutputRequest(diagnosticHttp).send(),
                {message: 'http error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should not fall on GET request', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticHttp, diagnosticResponse, {method: 'GET'}).send()
            );

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should not fall on POST request with body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticHttp, diagnosticResponse, {method: 'POST', body: 'test body'}).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
        });

        it('should not fall on POST request with empty body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticHttp, diagnosticResponse, {method: 'POST'}).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });
    });
});