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
    },
    flush() {
    }
};

const diagnosticHttp = {
    request() {
    }
};

const diagnosticOutputStream = {
    write() {
    },
    end() {
    }
};

function prepareDiagnostic() {
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
    diagnosticHttp.request = (url, options, cb) => {
        if (typeof url === 'object') {
            cb = options;
            options = url;
            url = undefined;
        }

        diagnosticHttp.options.url = url;
        diagnosticHttp.options.options = options;
        setTimeout(() => cb(testOptions), 0);
        return diagnosticOutputStream;
    };

    mock.method(diagnosticHttp, 'request');

    diagnosticResponse.options = {};
    diagnosticResponse.copy = (options) => {
        diagnosticResponse.options.options = options;
        return diagnosticResponse;
    };
    diagnosticResponse.flush = () => {
        return diagnosticResponse;
    }

    mock.method(diagnosticResponse, 'copy');
    mock.method(diagnosticResponse, 'flush');
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
                new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions);
            });

            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 0);
            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest().copy();
                new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).copy();
                new OutputRequest().copy(testOptions, diagnosticResponse, diagnosticHttp);
                new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).copy(testOptions, diagnosticResponse, diagnosticHttp);
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
        it('should fall, cause http is null', async () => {
            await assert.rejects(() => new OutputRequest(diagnosticResponse,undefined).send(),
                {cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause http throws error ', async () => {
            diagnosticHttp.request = () => {throw new Error('http error')};
            mock.method(diagnosticHttp, 'request');

            await assert.rejects(() => new OutputRequest(diagnosticResponse, diagnosticHttp, {}).send(),
                {message: 'http error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause requestOutputStream.end throws error', async () => {
            diagnosticOutputStream.end = () => {throw new Error('request end error')};
            mock.method(diagnosticOutputStream, 'end');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticHttp, {method: 'GET'}).send(),
                {message: 'request end error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause requestOutputStream.write throws error', async () => {
            diagnosticOutputStream.write = () => {throw new Error('request write error')};
            mock.method(diagnosticOutputStream, 'write');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticHttp, {method: 'POST', body: 'test body'})
                        .send(),
                {message: 'request write error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
        });

        it('should not fall, but options is null', async () => {
            await assert.doesNotReject(() =>
                    new OutputRequest(diagnosticResponse, diagnosticHttp, undefined).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response is null', async () => {
            await assert.rejects(() =>
                    new OutputRequest(undefined, diagnosticHttp, testOptions).send(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response.copy throws error', async () => {
            diagnosticResponse.copy = () => {throw new Error('response copy error')};
            mock.method(diagnosticResponse, 'copy');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).send(),
                {message: 'response copy error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response.flush throws error', async () => {
            diagnosticResponse.flush = () => {throw new Error('response flush error')};
            mock.method(diagnosticResponse, 'flush');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).send(),
                {message: 'response flush error'});

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on GET request', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticHttp, {method: 'GET'}).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on POST request with body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticHttp, {method: 'POST', body: 'test body'}).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on POST request without body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticHttp, {method: 'POST'}).send());

            assert.strictEqual(diagnosticHttp.request.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should return response with test options', async () => {
            const resultResponseInputStream = await new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).send();

            assert.deepStrictEqual(resultResponseInputStream.options.options, testOptions);
        });

        it('should send request with url', async () => {
            await new OutputRequest(diagnosticResponse, diagnosticHttp, {url: 'test', method: 'GET'}).send();

            assert.strictEqual(diagnosticHttp.options.url, 'test');
        });

        it('should send request without url', async () => {
            await new OutputRequest(diagnosticResponse, diagnosticHttp, testOptions).send();

            assert.strictEqual(diagnosticHttp.options.url, undefined);
        });
    });
});