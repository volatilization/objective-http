/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {OutputRequest} = require('../../../../js').client.request;

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

let diagnosticRequestFunction = () => {}
const diagnosticRequestFunctionOptions = {}

const diagnosticOutputStream = {
    once() {
    },
    write() {
    },
    end() {
    }
};

function prepareDiagnostic() {
    diagnosticOutputStream.options = {};
    diagnosticOutputStream.once = (event) => {
        diagnosticOutputStream.options.event = event;
    };
    diagnosticOutputStream.write = (body) => {
        diagnosticOutputStream.options.body = body;
    };
    diagnosticOutputStream.end = () => {
        return diagnosticOutputStream.options;
    };

    mock.method(diagnosticOutputStream, 'once');
    mock.method(diagnosticOutputStream, 'write');
    mock.method(diagnosticOutputStream, 'end');

    diagnosticRequestFunction = mock.fn((url, options, cb) => {
        if (typeof url === 'object') {
            cb = options;
            options = url;
            url = undefined;
        }

        diagnosticRequestFunctionOptions.url = url;
        diagnosticRequestFunctionOptions.options = options;
        setTimeout(() => cb(testOptions), 0);
        return diagnosticOutputStream;
    });

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
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions);
            });

            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 0);
            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 0);
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest().copy();
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).copy();
                new OutputRequest().copy(testOptions, diagnosticResponse, diagnosticRequestFunction);
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions)
                    .copy(testOptions, diagnosticResponse, diagnosticRequestFunction);
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
        it('should fall, cause requestFunction is null', async () => {
            await assert.rejects(() => new OutputRequest(diagnosticResponse,undefined).send(),
                {cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause requestFunction throws error ', async () => {
            diagnosticRequestFunction = mock.fn(() => {throw new Error('requestFunction error')});

            await assert.rejects(() => new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {}).send(),
                {message: 'requestFunction error', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
        });

        it('should fall, cause requestOutputStream.end throws error', async () => {
            diagnosticOutputStream.once = () => {throw new Error('request once error')};
            mock.method(diagnosticOutputStream, 'once');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'GET'}).send(),
                {message: 'request once error', cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
        });

        it('should fall, cause requestOutputStream.end throws error', async () => {
            diagnosticOutputStream.end = () => {throw new Error('request end error')};
            mock.method(diagnosticOutputStream, 'end');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'GET'}).send(),
                {message: 'request end error'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause requestOutputStream.write throws error', async () => {
            diagnosticOutputStream.write = () => {throw new Error('request write error')};
            mock.method(diagnosticOutputStream, 'write');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'POST', body: 'test body'})
                        .send(),
                {message: 'request write error'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 0);
        });

        it('should not fall, but options is null', async () => {
            await assert.doesNotReject(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, undefined).send());

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response is null', async () => {
            await assert.rejects(() =>
                    new OutputRequest(undefined, diagnosticRequestFunction, testOptions).send(),
                {cause: 'INVALID_REQUEST'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response.copy throws error', async () => {
            diagnosticResponse.copy = () => {throw new Error('response copy error')};
            mock.method(diagnosticResponse, 'copy');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send(),
                {message: 'response copy error'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should fall, cause response.flush throws error', async () => {
            diagnosticResponse.flush = () => {throw new Error('response flush error')};
            mock.method(diagnosticResponse, 'flush');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send(),
                {message: 'response flush error'});

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on GET request', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'GET'}).send());

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on POST request with body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'POST', body: 'test body'}).send());

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should not fall on POST request without body', async () => {
            await assert.doesNotReject(() =>
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {method: 'POST'}).send());

            assert.strictEqual(diagnosticRequestFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.once.mock.calls.length, 1);
            assert.strictEqual(diagnosticOutputStream.write.mock.calls.length, 0);
            assert.strictEqual(diagnosticOutputStream.end.mock.calls.length, 1);
        });

        it('should return response with test options', async () => {
            const resultResponseInputStream = await new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send();

            assert.deepStrictEqual(resultResponseInputStream.options.options, testOptions);
        });

        it('should send request with url', async () => {
            await new OutputRequest(diagnosticResponse, diagnosticRequestFunction, {url: 'test', method: 'GET'}).send();

            assert.strictEqual(diagnosticRequestFunctionOptions.url, 'test');
        });

        it('should send request without url', async () => {
            await new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send();

            assert.strictEqual(diagnosticRequestFunctionOptions.url, undefined);
        });
    });
});