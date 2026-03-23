module.exports = class ChunkClientRequest {
    #http;
    #options;
    #body;
    #response;

    constructor({ http, options, body, response }) {
        this.#http = http;
        this.#options = options;
        this.#body = body;
        this.#response = response;
    }

    with({
        http = this.#http,
        options = this.#options,
        body = this.#body,
        response = this.#response,
    }) {
        return new ChunkClientRequest({ http, options, body, response });
    }

    get http() {
        return this.#http;
    }

    get options() {
        return this.#options;
    }

    get body() {
        return this.#body;
    }

    get response() {
        return this.#response;
    }

    send() {
        return new Promise((resolve, reject) => {
            const requestStream = this.http.request(
                this.options,
                async (responseStream) => {
                    console.log('server responding ...');

                    try {
                        resolve(
                            await this.response
                                .with({
                                    responseStream,
                                })
                                .accept(),
                        );
                    } catch (e) {
                        reject(e);
                    }

                    /* this.response
                        .with({
                            responseStream,
                        })
                        .accept()
                        .then(resolve)
                        .catch(reject);*/
                },
            );

            console.log(requestStream);

            requestStream.on('error', (e) => {
                console.error(e);
                reject(
                    new Error(e.message, {
                        cause: { error: e, code: 'REQUEST_ERROR' },
                    }),
                );
            });

            if (this.body != null) {
                requestStream.write(this.body);
            }

            requestStream.end();
        });
    }
};
