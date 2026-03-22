module.exports = class EndpointHandler {
    #endpoint;
    #requset;
    #response;

    constructor({ endpoint, requset, response }) {
        this.#endpoint = endpoint;
        this.#requset = requset;
        this.#response = response;
    }

    async handle(requsetStream, responseStream) {
        const requset = await this.#requset
            .with({
                requsetStream,
            })
            .accept();

        if (
            JSON.stringify(requset.route) !==
            JSON.stringify(this.#endpoint.route)
        ) {
            return;
        }

        return this.#response
            .with({
                responseStream,
                ...(await this.#endpoint.handle(requset)),
            })
            .send();
    }
};
