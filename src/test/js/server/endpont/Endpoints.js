/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {Endpoints} = require('../../../../js').server.endpoint;


const testRoute = {
    method: 'method',
    path: 'path'
};

const diagnosticEndpoint = {
    route() {
    },
    handle() {
    }
};

const diagnosticCollection = [diagnosticEndpoint];

const diagnosticRequest = {
    route() {
    }
};

function prepareDiagnostic() {
    diagnosticEndpoint.options = {};
    diagnosticEndpoint.route = () => {
        return testRoute;
    };
    diagnosticEndpoint.handle = () => {
        return {statusCode: 200};
    };

    mock.method(diagnosticEndpoint, 'route');
    mock.method(diagnosticEndpoint, 'handle');

    diagnosticRequest.route = () => testRoute;

    mock.method(diagnosticRequest, 'route');
}

function resetDiagnostic() {
    mock.reset();
}

describe('Endpoints', () => {
    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Endpoints();
                new Endpoints([]);
            });
        });

        it('should fall cause of null collection', () => {
            assert.throws(() => {
                new Endpoints(null)
            }, {name: 'TypeError'});
        });
    });

    describe('copy', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Endpoints().copy();
                new Endpoints().copy([]);
            });
        });

        it('should return new Endpoints instance', () => {
            const endpoints = new Endpoints();
            const copyEndpoints = endpoints.copy();

            assert.notEqual(endpoints, copyEndpoints);
            assert.strictEqual(typeof endpoints, typeof copyEndpoints);
        });
    });

    describe('handle', () => {
        beforeEach(prepareDiagnostic);
        afterEach(resetDiagnostic);

        it('should fall on collections, cause null', async () => {
            await assert.throws(() => new Endpoints(null).handle(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticEndpoint.handle.mock.calls.length, 0);
        });

        it('should fall on request, cause null', async () => {
            await assert.rejects(() => new Endpoints(diagnosticCollection).handle(),
                {name: 'TypeError'});
        });

        it('should return 501 statusCode and body', async () => {
            await assert.rejects(() => new Endpoints([]).handle(diagnosticRequest),
                {name: 'Error', cause: 'HANDLER_NOT_FOUND'});
        });

        it('should return endpoint handle result', async () => {
            const handleResult = await new Endpoints(diagnosticCollection).handle(diagnosticRequest);

            assert.deepStrictEqual(handleResult, diagnosticEndpoint.handle());
            assert.deepStrictEqual(handleResult, {statusCode: 200});
        });
    });
});