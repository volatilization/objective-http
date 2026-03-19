module.exports = class JsonRequest {
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
        return new JsonRequest({ http, options, body, response });
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
            const req = this.http.request(this.options, (res) => {
                res.setEncoding('utf8');
                var chunks = '';
                res.on('data', (chunk) => {
                    chunks += chunk;
                });
                res.on('end', () => {
                    resolve(
                        this.response.with({
                            status: res.statusCode,
                            headers: new Headers(res.headers),
                            body: JSON.parse(chunks),
                        }),
                    );
                });
            });

            req.on('error', (e) => {
                reject(
                    new Error('Request error.', {
                        cause: { error: e, code: 'REQUEST_ERROR' },
                    }),
                );
            });

            if (this.body != null) {
                req.write(JSON.stringify(this.body));
            }

            req.end();
        });
    }
};
