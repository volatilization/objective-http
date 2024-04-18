module.exports = class OutputRequest {
    #http;
    #response;
    #options;

    constructor(http, response, options) {
        this.#http = http;
        this.#response = response;
        this.#options = {method: 'GET', ...options};
    }

    copy(options = this.#options, response = this.#response, http = this.#http) {
        return new OutputRequest(http, response, {method: 'GET', ...options});
    }

    send() {
        return new Promise((resolve, reject) => {
            try {
                this.#sendRequestOutputStream(
                    this.#configureRequestOutputStream(this.#http, this.#response, this.#options, resolve, reject),
                    this.#options);

            } catch (e) {
                throw new Error(e.message, {cause: 'INVALID_REQUEST'});
            }
        });
    }

    #configureRequestOutputStream(http, response, options, resolve, reject) {
        if (options.url != null) {
            return http.request(
                options.url,
                options,
                async (responseInputStream) => {
                    await this.#flushResponseInputStream(responseInputStream, response, resolve, reject);
                });
        }

        return http.request(
            options,
            async (responseInputStream) => {
                await this.#flushResponseInputStream(responseInputStream, response, resolve, reject);
            });
    }

    async #flushResponseInputStream(responseInputStream, response, resolve, reject) {
        try {
            resolve(await response
                .copy(responseInputStream)
                .flush());

        } catch (e) {
            reject(e);
        }
    }

    #sendRequestOutputStream(requestOutputStream, options) {
        if (this.#needToByWritten(options)) {
            requestOutputStream.write(options.body);
        }

        requestOutputStream.end();
    }

    #needToByWritten(options) {
        return ['POST', 'PUT'].some(method => method === options.method.toString().toUpperCase())
            && (options.body != null && typeof options.body === 'string');
    }
};