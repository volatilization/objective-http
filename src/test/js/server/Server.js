/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {Server} = require('../../../js').server;

const testPort = 80;
const testOptions = {
    port: testPort
};
const testResponseOptions = {
    'statusCode': 200
};

const diagnosticEndpoints = {
    handle() {
    }
};

const diagnosticOptions = {
    get port() {
        return this.diagnosticPort();
    },
    diagnosticPort() {
    }
};

const diagnosticRequest = {
    copy() {
    },
    flush() {
    }
};

const diagnosticResponse = {
    copy() {
    },
    flush() {
    }
};

let diagnosticCreateServerFunction = () => {
};

const diagnosticServer = {
    listen() {
    },
    close() {
    }
};

function prepareDiagnostic() {
    diagnosticOptions.diagnosticPort = () => {
        return testPort;
    };

    mock.method(diagnosticOptions, 'diagnosticPort');

    diagnosticCreateServerFunction = mock.fn(() => {
        return diagnosticServer;
    });

    diagnosticServer.options = {};
    diagnosticServer.listen = (options, cb) => {
        diagnosticServer.options.options = options;
        setTimeout(cb, 0);
        return diagnosticServer;
    };
    diagnosticServer.close = (cb) => {
        setTimeout(cb, 0);
        return diagnosticServer;
    };

    mock.method(diagnosticServer, 'listen');
    mock.method(diagnosticServer, 'close');

    diagnosticEndpoints.options = {};
    diagnosticEndpoints.handle = (request) => {
        diagnosticEndpoints.options.request = request;
        return testResponseOptions;
    };

    mock.method(diagnosticEndpoints, 'handle');

    diagnosticResponse.options = {};
    diagnosticResponse.copy = (options, responseStream) => {
        diagnosticResponse.options.options = options;
        diagnosticResponse.options.responseStream = responseStream;
        return diagnosticResponse;
    };
    diagnosticResponse.flush = () => {
        return testResponseOptions;
    };

    mock.method(diagnosticResponse, 'copy');
    mock.method(diagnosticResponse, 'flush');

    diagnosticRequest.options = {};
    diagnosticRequest.copy = (requestStream) => {
        diagnosticRequest.options.requestStream = requestStream;
        return diagnosticRequest;
    };
    diagnosticRequest.flush = () => {
        return diagnosticRequest;
    };

    mock.method(diagnosticRequest, 'copy');
    mock.method(diagnosticRequest, 'flush');
}

function resetDiagnostic() {
    mock.reset();
}

describe('Server', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new Server();
                new Server(
                    diagnosticEndpoints,
                    diagnosticOptions,
                    diagnosticRequest,
                    diagnosticResponse,
                    diagnosticCreateServerFunction,
                    diagnosticServer
                );
            });
        });
    });

    describe('start', () => {
        it('should fall, cause http is null', () => {
            assert.throws(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                null,
                diagnosticServer).start(), {name: 'TypeError'});

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 0);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause http.createServer is null', async () => {
            diagnosticCreateServerFunction = mock.fn(() => {return null});

            await assert.rejects(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer).start(), {name: 'TypeError'});

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause http.createServer throws error', () => {
            diagnosticCreateServerFunction = mock.fn(() => {throw new Error('createServer error')});

            assert.throws(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer).start(), {message: 'createServer error'});

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause server.listen throes error', async () => {
            diagnosticServer.listen = () => {
                throw new Error('listen error');
            };
            mock.method(diagnosticServer, 'listen');

            await assert.rejects(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .start(), {message: 'listen error'});

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
        });

        it('should send response with 200 status', async () => {
            diagnosticCreateServerFunction = mock.fn((cb) => {
                setTimeout(() => cb('requestStream', 'responseStream'), 0);
                return diagnosticServer;
            });

            await assert.doesNotReject(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .start())

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticEndpoints.handle.mock.calls.length, 1);

            assert.deepStrictEqual(diagnosticResponse.options.options, testResponseOptions);
            assert.strictEqual(diagnosticResponse.options.responseStream, 'responseStream');
            assert.strictEqual(diagnosticRequest.options.requestStream, 'requestStream');
            assert.deepStrictEqual(diagnosticEndpoints.options.request, diagnosticRequest);

            assert.strictEqual(diagnosticResponse.options.options.statusCode, 200);
        });

        it('should send response with 400 status', async () => {
            diagnosticCreateServerFunction = mock.fn((cb) => {
                setTimeout(() => cb('requestStream', 'responseStream'), 0);
                return diagnosticServer;
            });

            diagnosticRequest.flush = () => {throw new Error('request flush error', {cause: 'INVALID_REQUEST'})};
            mock.method(diagnosticRequest, 'flush');

            await assert.doesNotReject(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .start())

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticEndpoints.handle.mock.calls.length, 0);

            assert.deepStrictEqual(diagnosticResponse.options.options, {
                statusCode: 400,
                body: 'request flush error'
            });
            assert.strictEqual(diagnosticResponse.options.responseStream, 'responseStream');
            assert.strictEqual(diagnosticRequest.options.requestStream, 'requestStream');

            assert.strictEqual(diagnosticResponse.options.options.statusCode, 400);
        });

        it('should send response with 500 status', async () => {
            diagnosticCreateServerFunction = mock.fn((cb) => {
                setTimeout(() => cb('requestStream', 'responseStream'), 0);
                return diagnosticServer;
            });

            diagnosticEndpoints.handle = () => {throw new Error('endpoint handle error')};
            mock.method(diagnosticEndpoints, 'handle');

            await assert.doesNotReject(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .start())

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticResponse.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.copy.mock.calls.length, 1);
            assert.strictEqual(diagnosticRequest.flush.mock.calls.length, 1);
            assert.strictEqual(diagnosticEndpoints.handle.mock.calls.length, 1);

            assert.deepStrictEqual(diagnosticResponse.options.options, {
                statusCode: 500,
                body: 'Unexpected server error.'
            });
            assert.strictEqual(diagnosticResponse.options.responseStream, 'responseStream');
            assert.strictEqual(diagnosticRequest.options.requestStream, 'requestStream');

            assert.strictEqual(diagnosticResponse.options.options.statusCode, 500);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .start());

            assert.strictEqual(diagnosticCreateServerFunction.mock.calls.length, 1);
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
        });

        it('should accept options', async () => {
            const server = await new Server(
                undefined,
                testOptions,
                undefined,
                undefined,
                diagnosticCreateServerFunction).start();

            assert.deepStrictEqual(server.options(), testOptions);
            assert.deepStrictEqual(diagnosticServer.options.options, testOptions);
        });

        it('should return new Server instance', async () => {
            const server = new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer);
            const staredServer = await server.start();

            assert.notEqual(staredServer, server);
            assert.strictEqual(typeof staredServer, typeof server);
        });
    });

    describe('stop', () => {
        it('should fall, cause null', async () => {
            await assert.rejects(() => new Server().stop(), {name: 'TypeError'});

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 0);
        });

        it('should fall, cause server.close throes error', async () => {
            diagnosticServer.close = () => {
                throw new Error('close error');
            };
            mock.method(diagnosticServer, 'close');

            await assert.rejects(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .stop(), {message: 'close error'});

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 1);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new Server(
                diagnosticEndpoints,
                diagnosticOptions,
                diagnosticRequest,
                diagnosticResponse,
                diagnosticCreateServerFunction,
                diagnosticServer)
                .stop());

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 1);
        });

        it('should return new Server instance', async () => {
           const server = new Server(
               diagnosticEndpoints,
               diagnosticOptions,
               diagnosticRequest,
               diagnosticResponse,
               diagnosticCreateServerFunction,
               diagnosticServer);
            const stoppedServer = await server.stop();

            assert.notEqual(stoppedServer, server);
            assert.strictEqual(typeof stoppedServer, typeof server);
        });
    });

    describe('options', () => {
        it('should return same options', () => {
            const resultOptions = new Server(undefined, testOptions).options();

            assert.deepStrictEqual(resultOptions, testOptions);
        });
    });
});