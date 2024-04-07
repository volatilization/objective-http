module.exports = class GetTestEndpoint {
    #origin;

    constructor(origin) {
        this.#origin = origin;
    }

    route() {
        return this.#origin
            .copy('GET', '/api')
            .route();
    }

    async handle(request) {
        return await this.#get(await this.#origin.handle(request), request.query().get('a'));
    }

    #get(response, a) {
        let j = 0;
        for (let i = 0; i < 5000000000; i++) {
            j ++;
        }

        return {body: a};
    }
}