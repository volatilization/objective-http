module.exports = class RequestHandler {
    #stream;

    constructor({ stream }) {
        this.#stream = stream;
    }

    with({ stream = this.#stream }) {
        return new RequestHandler({ stream });
    }

    dodo() {}
};
