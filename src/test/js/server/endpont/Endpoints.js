/* node:coverage disable */

const {Endpoints} = require('../../../../js/index').server;
const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const testRoute = {
    method: 'method',
    path: 'path'
};

const diagnosticEndpoint = {
    copy() {
    },
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
    diagnosticEndpoint.copy = (method, path) => {
        diagnosticEndpoint.options.method = method;
        diagnosticEndpoint.options.path = path;
        return diagnosticEndpoint;
    };
    diagnosticEndpoint.route = () => {
        return testRoute;
    };
    diagnosticEndpoint.handle = () => {
        return {statusCode: 200};
    };

    mock.method(diagnosticEndpoint, 'copy');
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
            await assert.rejects(() => new Endpoints(null).handle(),
                {name: 'TypeError'});
        });

        it('should fall on request, cause null', async () => {
            await assert.rejects(() => new Endpoints(diagnosticCollection).handle(),
                {name: 'TypeError'});
        });

        it('should return 501 statusCode and body', async () => {
            const handleResult = await new Endpoints([]).handle();

            assert.deepStrictEqual(handleResult, {
                statusCode: 501,
                body: 'There are no handler for request.'
            });
        });

        it('should return endpoint handle result', async () => {
            const handleResult = await new Endpoints(diagnosticCollection).handle(diagnosticRequest);

            assert.deepStrictEqual(handleResult, diagnosticEndpoint.handle());
            assert.deepStrictEqual(handleResult, {statusCode: 200});
        });
    });
});