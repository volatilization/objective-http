/* node:coverage disable */

const {describe, test, mock, spyOn, expect, beforeEach, afterEach} = require('bun:test');
const assert = require('node:assert');

const {OutputRequest} = require('../../../../../js').bun.client;

const testOptions = {
    statusCode: 200,
    method: 'GET',
    headers: {header: 'header'},
    url: 'http://localhost',
    body: 'test body'
};

const testResponse = {
    statusCode: 200,
    headers: {header: 'header'},
    body: 'test body'
};

const diagnosticResponse = {
    copy() {
    },
    flush() {
    }
};

let diagnosticRequestFunction = () => {};
const diagnosticRequestFunctionOptions = {};

function prepareDiagnostic() {
    diagnosticResponse.options = {};
    diagnosticResponse.copy = (responseStream) => {
        diagnosticResponse.options.responseStream = responseStream;
        return diagnosticResponse;
    };
    diagnosticResponse.flush = () => {
        return testResponse;
    }
    diagnosticResponse.spy = {
        copy: spyOn(diagnosticResponse, 'copy'),
        flush: spyOn(diagnosticResponse, 'flush')
    }

    diagnosticRequestFunction = mock((url, options) => {
        diagnosticRequestFunctionOptions.url = url;
        diagnosticRequestFunctionOptions.options = options;

        return testResponse;
    });
}

function resetDiagnostic() {
    diagnosticResponse.spy = null;
}

describe('OutputRequest', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest();
                new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions);
            });

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });
    });

    describe('copy', () => {
        test('should not call anything', () => {
            assert.doesNotThrow(() => {
                new OutputRequest().copy();
                new OutputRequest(diagnosticResponse, testOptions).copy();
                new OutputRequest().copy(testOptions, diagnosticResponse);
                new OutputRequest(diagnosticResponse, testOptions).copy(testOptions, diagnosticResponse);
            });
        });

        test('should return new InputRequest instance', () => {
            const inputResponse = new OutputRequest();
            const copyInputResponse = inputResponse.copy();

            assert.notEqual(inputResponse, copyInputResponse);
            assert.strictEqual(typeof inputResponse, typeof copyInputResponse);
        });
    });

    describe('send', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        test('should fall, cause options is null', async () => {
            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, undefined).send(),
                {cause: 'INVALID_REQUEST'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause requestFunction is null', async () => {
            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, undefined, testOptions).send(),
                {cause: 'INVALID_REQUEST'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause requestFunction throws error', async () => {
            diagnosticRequestFunction = mock(() => {throw new Error('requestFunction error')});

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send(),
                {message: 'requestFunction error'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(1);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause response is null', async () => {
            await assert.rejects(() =>
                    new OutputRequest(undefined, diagnosticRequestFunction, testOptions).send(),
                {cause: 'INVALID_REQUEST'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(0);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause response.copy throws error', async () => {
            diagnosticResponse.copy = () => {throw new Error('response copy error')};
            diagnosticResponse.spy.copy = spyOn(diagnosticResponse, 'copy');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send(),
                {message: 'response copy error'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(1);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(1);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(0);
        });

        test('should fall, cause response.flush throws error', async () => {
            diagnosticResponse.flush = () => {throw new Error('response flush error')};
            diagnosticResponse.spy.flush = spyOn(diagnosticResponse, 'flush');

            await assert.rejects(() =>
                    new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send(),
                {message: 'response flush error'});

            expect(diagnosticRequestFunction).toHaveBeenCalledTimes(1);
            expect(diagnosticResponse.spy.copy).toHaveBeenCalledTimes(1);
            expect(diagnosticResponse.spy.flush).toHaveBeenCalledTimes(1);
        });

        test('should return response with test options', async () => {
            const resultOutputRequest = await new OutputRequest(diagnosticResponse, diagnosticRequestFunction, testOptions).send();

            assert.deepStrictEqual(resultOutputRequest, testResponse);
            assert.deepStrictEqual(diagnosticResponse.options.responseStream, testResponse);
            assert.deepStrictEqual(diagnosticRequestFunctionOptions.options, testOptions);
            assert.deepStrictEqual(diagnosticRequestFunctionOptions.url, testOptions.url);
        });
    });
});