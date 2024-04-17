module.exports = class OutputRequest {
    #http;
    #response;
    #options;

    constructor(http, response, options) {
        this.#http = http;
        this.#response = response;
        this.#options = options;
    }

    copy(options = this.#options, response = this.#response, http = this.#http) {
        return new OutputRequest(options, response, http);
    }

    send() {
        return new Promise((resolve, reject) => {
            const requestOutputStream = this.#http.request(this.#options, (responseInputStream) => {
                responseInputStream.once('error', (e) => reject(e));

                const chunks = [];
                responseInputStream.on('data', (chunk) => chunks.push(chunk));
                responseInputStream.on('end', () => resolve(this.#response.copy({
                    statusCode: responseInputStream.statusCode,
                    headers: new Headers(responseInputStream.headers),
                    body: Buffer.concat(chunks)
                })));
            });

            if (this.#isChunkedOutputStream(this.#options.method) && this.#options.body != null) {
                requestOutputStream.write(this.#options.body);
            }

            requestOutputStream.end();
        })
    }

    #isChunkedOutputStream(requestMethod) {
        return ['POST', 'PUT'].some(method => method === requestMethod.toString().toUpperCase());
    }
}