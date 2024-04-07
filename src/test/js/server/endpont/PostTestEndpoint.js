module.exports = class PostTestEndpoint {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    route() {
        return this.#origin
            .copy('POST', '/api')
            .route();
    }

    async handle(request) {
        return this.#post(await this.#origin.handle(request), request.body(), request.query().get('s'));
    }

    #post(response, body, s) {
        return {body: JSON.stringify({...body, s: s})}
    }
}