/* node:coverage disable */

const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');

const {LoggedServer} = require('../../../js').server;

const diagnosticLogger = {
    debug() {
    }
}

const diagnosticOrigin = {
    start() {
    },
    stop() {
    },
    options() {
    }
}

function prepareDiagnostic() {
    diagnosticLogger.options = {};
    diagnosticLogger.debug = (message) => {
        diagnosticLogger.options.message = message;
        return diagnosticLogger;
    }

    mock.method(diagnosticLogger, 'debug');

    diagnosticOrigin.start = () => {
        return diagnosticOrigin;
    }
    diagnosticOrigin.stop = () => {
        return diagnosticOrigin;
    }
    diagnosticOrigin.options = () => {
        return {port: 80};
    }

    mock.method(diagnosticOrigin, 'start');
    mock.method(diagnosticOrigin, 'stop');
    mock.method(diagnosticOrigin, 'options');
}

function resetDiagnostic() {
    mock.reset();
}

describe('LoggedServer', () => {
    beforeEach(prepareDiagnostic);
    afterEach(resetDiagnostic);

    describe('constructor', () => {
        it('should not call anything', () => {
            assert.doesNotThrow(() => {
                new LoggedServer();
                new LoggedServer(diagnosticOrigin, diagnosticLogger);
            });
        });
    });

    describe('start', () => {
        it('should fall, cause origin is null', async () => {
            await assert.rejects(() => new LoggedServer().start(),
                {name: 'TypeError'});
        });

        it('should fall, cause origin start throws error', async () => {
            diagnosticOrigin.start = () => {throw new Error('start error')};
            mock.method(diagnosticOrigin, 'start');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin).start(),
                {message: 'start error'});

            assert.strictEqual(diagnosticOrigin.start.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 0);
        });

        it('should fall, cause origin options throws error', async () => {
            diagnosticOrigin.options = () => {throw new Error('options error')};
            mock.method(diagnosticOrigin, 'options');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).start(),
                {message: 'options error'});

            assert.strictEqual(diagnosticOrigin.start.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
        });

        it('should fall, cause logger is null', async () => {
            await assert.rejects(() => new LoggedServer(diagnosticOrigin).start(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.start.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 0);
        });

        it('should fall, cause logger debug throws error', async () => {
            diagnosticLogger.debug = () => {throw new Error('debug error')};
            mock.method(diagnosticLogger, 'debug');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).start(),
                {message: 'debug error'});

            assert.strictEqual(diagnosticOrigin.start.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length , 1);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).start(),);

            assert.strictEqual(diagnosticOrigin.start.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length , 1);
        });

        it('should logg message', async () => {
            await assert.doesNotReject(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).start());

            assert.strictEqual(diagnosticLogger.options.message, 'HttpServer is running at port: 80');
        });

        it('should return new Server instance', async () => {
            const server = new LoggedServer(diagnosticOrigin, diagnosticLogger);
            const startedServer = await server.start();

            assert.notEqual(server, startedServer);
            assert.strictEqual(typeof server, typeof startedServer)
        });
    });

    describe('stop', () => {
        it('should fall, cause origin is null', async () => {
            await assert.rejects(() => new LoggedServer().stop(),
                {name: 'TypeError'});
        });

        it('should fall, cause origin stop throws error', async () => {
            diagnosticOrigin.stop = () => {throw new Error('stop error')};
            mock.method(diagnosticOrigin, 'stop');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin).stop(),
                {message: 'stop error'});

            assert.strictEqual(diagnosticOrigin.stop.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 0);
        });

        it('should fall, cause origin options throws error', async () => {
            diagnosticOrigin.options = () => {throw new Error('options error')};
            mock.method(diagnosticOrigin, 'options');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).stop(),
                {message: 'options error'});

            assert.strictEqual(diagnosticOrigin.stop.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
        });

        it('should fall, cause logger is null', async () => {
            await assert.rejects(() => new LoggedServer(diagnosticOrigin).stop(),
                {name: 'TypeError'});

            assert.strictEqual(diagnosticOrigin.stop.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 0);
        });

        it('should fall, cause logger debug throws error', async () => {
            diagnosticLogger.debug = () => {throw new Error('debug error')};
            mock.method(diagnosticLogger, 'debug');

            await assert.rejects(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).stop(),
                {message: 'debug error'});

            assert.strictEqual(diagnosticOrigin.stop.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length , 1);
        });

        it('should not fall', async () => {
            await assert.doesNotReject(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).stop(),);

            assert.strictEqual(diagnosticOrigin.stop.mock.calls.length , 1);
            assert.strictEqual(diagnosticOrigin.options.mock.calls.length , 1);
            assert.strictEqual(diagnosticLogger.debug.mock.calls.length , 1);
        });

        it('should logg message', async () => {
            await assert.doesNotReject(() => new LoggedServer(diagnosticOrigin, diagnosticLogger).stop());

            assert.strictEqual(diagnosticLogger.options.message, 'HttpServer at port: 80 is stopped');
        });

        it('should return new Server instance', async () => {
            const server = new LoggedServer(diagnosticOrigin, diagnosticLogger);
            const stoppedServer = await server.stop();

            assert.notEqual(server, stoppedServer);
            assert.strictEqual(typeof server, typeof stoppedServer)
        });
    });

    describe('options', () => {
        it('should return same options', () => {
            const resultOptions = new LoggedServer(diagnosticOrigin, diagnosticLogger).options();

            assert.deepStrictEqual(resultOptions, diagnosticOrigin.options());
        });
    });
});