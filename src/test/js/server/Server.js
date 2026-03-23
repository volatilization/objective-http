/* node:coverage disable */

const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const { Server } = require('../../../js').server;

const testPort = 80;
const testOptions = {
    port: testPort,
};
const testResponseOptions = {
    statusCode: 200,
};

var diagnosticHandler = {
    handle() {},
};

var diagnosticOptions = {
    get port() {
        return this.diagnosticPort();
    },
    diagnosticPort() {},
};

var diagnosticHttp = {
    createServer() {},
};

var diagnosticServer = {
    listen() {},
    close() {},
};

function prepareDiagnostic() {
    diagnosticOptions.diagnosticPort = () => {
        return testPort;
    };

    mock.method(diagnosticOptions, 'diagnosticPort');

    diagnosticHttp.options = {};
    diagnosticHttp.createServer = () => {
        return diagnosticServer;
    };

    mock.method(diagnosticHttp, 'createServer');

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

    diagnosticHandler.options = {};
    diagnosticHandler.handle = (requestStream, responseStream) => {
        diagnosticHandler.options.requestStream = requestStream;
        diagnosticHandler.options.responseStream = responseStream;
        return testResponseOptions;
    };

    mock.method(diagnosticHandler, 'handle');
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
                new Server({});
                new Server({
                    handler: diagnosticHandler,
                    options: diagnosticOptions,
                    http: diagnosticHttp,
                    server: diagnosticServer,
                });
            });
        });
    });

    describe('start', () => {
        it('should fall, cause http is null', () => {
            assert.throws(
                () =>
                    new Server({
                        handler: diagnosticHandler,
                        options: diagnosticOptions,
                        http: null,
                        server: diagnosticServer,
                    }).start(),
                { name: 'TypeError' },
            );

            assert.strictEqual(
                diagnosticHttp.createServer.mock.calls.length,
                0,
            );
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause http.createServer is null', async () => {
            diagnosticHttp = {
                createServer() {
                    return null;
                },
            };

            mock.method(diagnosticHttp, 'createServer');

            await assert.rejects(
                () =>
                    new Server({
                        handler: diagnosticHandler,
                        options: diagnosticOptions,
                        http: diagnosticHttp,
                        server: diagnosticServer,
                    }).start(),
                { name: 'TypeError' },
            );

            assert.strictEqual(
                diagnosticHttp.createServer.mock.calls.length,
                1,
            );
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause http.createServer throws error', () => {
            diagnosticHttp = {
                createServer() {
                    throw new Error('createServer error');
                },
            };

            mock.method(diagnosticHttp, 'createServer');

            assert.throws(
                () =>
                    new Server({
                        handler: diagnosticHandler,
                        options: diagnosticOptions,
                        http: diagnosticHttp,
                        server: diagnosticServer,
                    }).start(),
                { message: 'createServer error' },
            );

            assert.strictEqual(
                diagnosticHttp.createServer.mock.calls.length,
                1,
            );
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 0);
        });

        it('should fall, cause server.listen throes error', async () => {
            diagnosticServer.listen = () => {
                throw new Error('listen error');
            };
            mock.method(diagnosticServer, 'listen');

            await assert.rejects(
                () =>
                    new Server({
                        handler: diagnosticHandler,
                        options: diagnosticOptions,
                        http: diagnosticHttp,
                        server: diagnosticServer,
                    }).start(),
                { message: 'listen error' },
            );

            assert.strictEqual(
                diagnosticHttp.createServer.mock.calls.length,
                1,
            );
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
        });

        it('should successfuly handle', async () => {
            diagnosticHttp = {
                createServer(cb) {
                    setTimeout(() => cb('requestStream', 'responseStream'), 0);
                    return diagnosticServer;
                },
            };

            mock.method(diagnosticHttp, 'createServer');

            await assert.doesNotReject(() =>
                new Server({
                    handler: diagnosticHandler,
                    options: diagnosticOptions,
                    http: diagnosticHttp,
                    server: diagnosticServer,
                }).start(),
            );

            assert.strictEqual(
                diagnosticHttp.createServer.mock.calls.length,
                1,
            );
            assert.strictEqual(diagnosticServer.listen.mock.calls.length, 1);
            assert.strictEqual(diagnosticHandler.handle.mock.calls.length, 1);

            assert.strictEqual(
                diagnosticHandler.options.responseStream,
                'responseStream',
            );
            assert.strictEqual(
                diagnosticHandler.options.requestStream,
                'requestStream',
            );
        });

        it('should return new Server instance', async () => {
            const server = new Server({
                handler: diagnosticHandler,
                options: diagnosticOptions,
                http: diagnosticHttp,
                server: diagnosticServer,
            });
            const staredServer = await server.start();

            assert.notEqual(staredServer, server);
            assert.strictEqual(typeof staredServer, typeof server);
        });
    });

    describe('stop', () => {
        it('should fall, cause null', async () => {
            await assert.rejects(() => new Server({}).stop(), {
                name: 'TypeError',
            });

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 0);
        });

        it('should fall, cause server.close throes error', async () => {
            diagnosticServer.close = () => {
                throw new Error('close error');
            };
            mock.method(diagnosticServer, 'close');

            await assert.rejects(
                () =>
                    new Server({
                        server: diagnosticServer,
                    }).stop(),
                { message: 'close error' },
            );

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 1);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() =>
                new Server({
                    server: diagnosticServer,
                }).stop(),
            );

            assert.strictEqual(diagnosticServer.close.mock.calls.length, 1);
        });

        it('should return new Server instance', async () => {
            const server = new Server({
                server: diagnosticServer,
            });
            const stoppedServer = await server.stop();

            assert.notEqual(stoppedServer, server);
            assert.strictEqual(typeof stoppedServer, typeof server);
        });
    });

    describe('options', () => {
        it('should return same options', () => {
            const resultOptions = new Server({ options: testOptions }).options;

            assert.deepStrictEqual(resultOptions, testOptions);
        });
    });
});
