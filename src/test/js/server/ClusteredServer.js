/* node:coverage disable */

const {ClusteredServer} = require('../../../js/index').server;
const {describe, it, mock, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert');


function prepareDiagnostic() {
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
                new ClusteredServer();
            });
        });
    });
});